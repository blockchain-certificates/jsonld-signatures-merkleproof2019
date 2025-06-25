import { Decoder } from '@vaultie/lds-merkle-proof-2019';
import jsigs from 'jsonld-signatures';
import { lookForTx, type ExplorerAPI, type TransactionData, type IBlockchainObject } from '@blockcerts/explorer-lookup';
import getTransactionId from './helpers/getTransactionId.js';
import getChain from './helpers/getChain.js';
import { removeEntry } from './utils/array.js';
import {
  assertProofValidity,
  isTransactionIdValid,
  computeLocalHash,
  ensureHashesEqual,
  ensureMerkleRootEqual,
  ensureValidReceipt,
  deriveIssuingAddressFromPublicKey,
  compareIssuingAddress
} from './inspectors/index.js';
import isMockChain from './helpers/isMockChain.js';
import VerifierError from './models/VerifierError.js';
import type IVerificationMethod from './models/VerificationMethod';
import { type DecodedProof, type VCProof } from './models/Proof';

const { LinkedDataProof } = jsigs.suites;

export interface MerkleProof2019Options {
  explorerAPIs?: ExplorerAPI[];
  executeStepMethod?: (step: string, action: () => any, verificationSuite?: string, type?: string) => Promise<any>;
  issuerEndpoint?: string; // server endpoint used to sign credentials
}

export interface VCDocument {
  proof: VCProof | VCProof[];
}

export interface MerkleProof2019API {
  options?: MerkleProof2019Options;
  issuer?: any; // TODO: define issuer type
  verificationMethod?: IVerificationMethod;
  document?: VCDocument;
  proof?: VCProof;
  // the purpose of proof that the verifier will be used for, defaults to assertionMethod
  proofPurpose?: string;
  domain?: string | string[];
  challenge?: string;
}

export interface MerkleProof2019VerificationResult {
  verified: boolean;
  error?: string;
  verificationMethod: IVerificationMethod;
}

export interface MerkleProof2019VerifyProofAPI {
  documentLoader?: (url: string) => any; // jsonld document loader hook
  verifyIdentity?: boolean; // allow splitting verification process for more control,
  proof?: VCProof;
  document?: VCDocument; // document to verify, if not provided the one passed to the constructor will be used
}

export class LDMerkleProof2019 extends LinkedDataProof {
  /**
   * @param [issuer] {string} A key id URL to the paired public key.
   * @param [verificationMethod] {string} A key id URL to the paired public key.
   * @param [proof] {object} a JSON-LD document with options to use for
   *   the `proof` node (e.g. any other custom fields can be provided here
   *   using a context different from security-v2).
   * @param [document] {document} document used and signed by the MerkleProof2019 signature
   */
  public challenge: string;
  public domain: string[];
  public type: string = 'MerkleProof2019';
  public issuer: any = null; // TODO: define issuer type
  public issuerEndpoint: string = '';
  public verificationMethod: IVerificationMethod = null;
  public externalProof: VCProof = null; // external proof passed to the constructor, used for verification
  public proof: VCProof = null;
  public proofValue: DecodedProof = null;
  public proofPurpose: string;
  public document: VCDocument = null;
  public explorerAPIs: ExplorerAPI[] = [];
  public chain: IBlockchainObject;
  public txData: TransactionData;
  public localDocumentHash: string;
  public derivedIssuingAddress: string;
  public documentLoader = null;
  public proofVerificationProcess = [
    'assertProofValidity',
    'getTransactionId',
    'computeLocalHash',
    'fetchRemoteHash',
    'compareHashes',
    'checkMerkleRoot',
    'checkReceipt'
  ];

  public identityVerificationProcess = [
    'deriveIssuingAddressFromPublicKey',
    'ensureVerificationMethodValidity',
    'compareIssuingAddress'
  ];

  private transactionId: string = '';

  constructor ({
    issuer = null,
    verificationMethod = null,
    document = null,
    proof = null,
    options = {},
    proofPurpose = 'assertionMethod',
    domain = [],
    challenge = ''
  }: MerkleProof2019API) {
    super({ type: 'MerkleProof2019' });

    this.issuer = issuer;
    this.verificationMethod = verificationMethod;
    this.document = document;
    this.proofPurpose = proofPurpose;
    this.domain = Array.isArray(domain) ? domain : [domain];
    this.challenge = challenge;
    this.externalProof = proof;
    this.setOptions(options);

    if (this.externalProof || this.document) {
      this.setProof(this.externalProof);
      this.getChain();
      if (isMockChain(this.chain)) {
        this.adaptProofVerificationProcessToMocknet();
        this.adaptIdentityVerificationProcessToMocknet();
      }
    }
  }

  static decodeMerkleProof2019 (proof: VCProof): DecodedProof {
    const base58Decoder = new Decoder(proof.proofValue);
    return base58Decoder.decode();
  }

  createVerifier () {}

  createVerifyData () {} 

  setProof (externalProof: VCProof = null): void {
    const proof = externalProof ?? this.document.proof;
    if (!proof) {
      throw new Error('The passed document is not signed.');
    }

    this.proof = proof as any; // TODO: might be an error if externalProof is not defined and document has multiproof
    this.proofValue = LDMerkleProof2019.decodeMerkleProof2019(this.proof);
  }

  async verifyProof ({ documentLoader, verifyIdentity, document, proof }: MerkleProof2019VerifyProofAPI = {
    documentLoader: (url): any => {},
    verifyIdentity: true
  }): Promise<MerkleProof2019VerificationResult> {
    this.documentLoader = documentLoader;
    let verified: boolean;
    let error: string = '';

    if (document) {
      this.document = document;
    }

    if (proof) {
      this.setProof(proof);
    }

    this.getChain();
    if (isMockChain(this.chain)) {
      this.adaptProofVerificationProcessToMocknet();
      this.adaptIdentityVerificationProcessToMocknet();
    }

    if (!this.document) {
      throw new Error('A document signed by MerkleProof2019 is required for the verification process.');
    }

    try {
      await this.verifyProcess(this.proofVerificationProcess);
      if (verifyIdentity) {
        await this.verifyIdentity();
      }

      verified = true;
    } catch (e) {
      console.error(e);
      verified = false;
      error = e.message;
    }
    return {
      verificationMethod: this.verificationMethod,
      verified,
      error
    };
  }

  async createProof({ document, purpose = 'assertionMethod' }: { document: VCDocument; purpose?: string }) {
    if (!this.issuerEndpoint) {
      throw new Error('No issuer endpoint provided. ' +
        'Please set the issuerEndpoint option when instantiating the suite.');
    }
    const response = await fetch(
      this.issuerEndpoint,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          credential: document
        })
      })
      .then(response => response.json())
      .catch(error => {
        console.error(error);
      });

    if (response.verifiableCredential) {
      return response.verifiableCredential.proof;
    } else {
      console.error('An error occurred while creating the proof:', response);
    }
  }

  async createProofValue ({ document }) {
    const proof = await this.createProof({ document });
    return proof ? proof.proofValue : 'error creating proof';
  }

  ensureSuiteContext (): void {}

  async verifyIdentity (): Promise<void> {
    if (this.verificationMethod != null) {
      try {
        await this.verifyProcess(this.identityVerificationProcess);
      } catch (e) {
        throw new Error(e);
      }
    }
  }

  getProofVerificationProcess (): string[] {
    return this.proofVerificationProcess;
  }

  getIdentityVerificationProcess (): string[] {
    return this.identityVerificationProcess;
  }

  getIssuerPublicKey (): string {
    if (isMockChain(this.chain)) {
      return 'This mock chain does not support issuing addresses';
    }
    return this.getTxData()?.issuingAddress ?? '';
  }

  getIssuanceTime (): string {
    return this.getTxData()?.time as string ?? '';
  }

  getChain (): IBlockchainObject {
    if (!this.chain) {
      this.chain = getChain(this.proofValue);
    }
    return this.chain;
  }

  private getTxData (): TransactionData {
    if (!this.txData) {
      console.error('Trying to access issuing address when txData not available yet. Did you run the `verify` method yet?');
      return null;
    }

    return this.txData;
  }

  private adaptProofVerificationProcessToMocknet (): void {
    removeEntry(this.proofVerificationProcess, 'getTransactionId');
    removeEntry(this.proofVerificationProcess, 'fetchRemoteHash');
    removeEntry(this.proofVerificationProcess, 'checkMerkleRoot');
  }

  private adaptIdentityVerificationProcessToMocknet (): void {
    this.identityVerificationProcess = [
      'ensureVerificationMethodValidity'
    ];
  }

  private setOptions (options: MerkleProof2019Options): void {
    this.explorerAPIs = options.explorerAPIs ?? [];
    if (options.executeStepMethod && typeof options.executeStepMethod === 'function') {
      this.executeStep = options.executeStepMethod;
    }

    this.issuerEndpoint = options.issuerEndpoint ?? '';
  }

  private async executeStep (step: string, action, verificationSuite = ''): Promise<any> {
    const res: any = await action();
    return res;
  }

  private async verifyProcess (process: string[]): Promise<void> {
    for (const verificationStep of process) {
      if (!this[verificationStep]) {
        console.error('verification logic for', verificationStep, 'not implemented');
        return;
      }
      await this[verificationStep]();
    }
  }

  private async assertProofValidity (): Promise<void> {
    await this.executeStep(
      'assertProofValidity',
      () => assertProofValidity({
        expectedProofPurpose: this.proofPurpose,
        expectedDomain: this.domain,
        expectedChallenge: this.challenge,
        proof: this.proof,
        issuer: this.issuer
      }),
      this.type // do not remove here or it will break CVJS
    );
  }

  private async checkMerkleRoot (): Promise<void> {
    await this.executeStep(
      'checkMerkleRoot',
      () => ensureMerkleRootEqual(this.proofValue.merkleRoot, this.txData.remoteHash),
      this.type // do not remove here or it will break CVJS
    );
  }

  private async compareHashes (): Promise<void> {
    await this.executeStep(
      'compareHashes',
      () => ensureHashesEqual(this.localDocumentHash, this.proofValue.targetHash),
      this.type // do not remove here or it will break CVJS
    );
  }

  private async computeLocalHash (): Promise<void> {
    this.localDocumentHash = await this.executeStep(
      'computeLocalHash',
      async () => await computeLocalHash(this.document, this.proof, this.documentLoader),
      this.type // do not remove here or it will break CVJS
    );
  }

  private async checkReceipt (): Promise<void> {
    await this.executeStep(
      'checkReceipt',
      () => { ensureValidReceipt(this.proofValue); },
      this.type
    );
  }

  private async getTransactionId (): Promise<string> {
    this.transactionId = getTransactionId(this.proofValue);
    const transactionId: string = await this.executeStep(
      'getTransactionId',
      () => isTransactionIdValid(this.transactionId),
      this.type // do not remove here or it will break CVJS
    );
    return transactionId;
  }

  private async fetchRemoteHash (): Promise<void> {
    this.txData = await this.executeStep(
      'fetchRemoteHash',
      async () => {
        const txData = await lookForTx({
          transactionId: this.transactionId,
          chain: this.chain?.code,
          explorerAPIs: this.explorerAPIs
        });
        return txData;
      },
      this.type // do not remove here or it will break CVJS
    );
  }

  // ##### DID CORRELATION #####
  private async deriveIssuingAddressFromPublicKey (): Promise<void> {
    this.derivedIssuingAddress = await this.executeStep(
      'deriveIssuingAddressFromPublicKey',
      async () => await deriveIssuingAddressFromPublicKey(this.verificationMethod, this.chain),
      this.type
    );
  }

  private async ensureVerificationMethodValidity (): Promise<void> {
    await this.executeStep(
      'ensureVerificationMethodValidity',
      async (): Promise<void> => {
        if (this.verificationMethod.expires) {
          const expirationDate = new Date(this.verificationMethod.expires).getTime();
          if (expirationDate < Date.now()) {
            throw new VerifierError('ensureVerificationMethodValidity', 'The verification key has expired');
          }
        }

        if (this.verificationMethod.revoked) {
          // waiting on clarification https://github.com/w3c/cid/issues/152
          throw new VerifierError('ensureVerificationMethodValidity', 'The verification key has been revoked');
        }
      },
      this.type
    );
  }

  private async compareIssuingAddress (): Promise<void> {
    await this.executeStep(
      'compareIssuingAddress',
      () => { compareIssuingAddress(this.getIssuerPublicKey(), this.derivedIssuingAddress); },
      this.type
    );
  }
}
