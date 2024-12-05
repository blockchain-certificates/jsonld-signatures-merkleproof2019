import { Decoder } from '@vaultie/lds-merkle-proof-2019';
import jsigs from 'jsonld-signatures';
import { lookForTx, type ExplorerAPI, type TransactionData, type IBlockchainObject } from '@blockcerts/explorer-lookup';
import { type DecodedProof, type VCProof } from './models/Proof';
import getTransactionId from './helpers/getTransactionId';
import getChain from './helpers/getChain';
import { removeEntry } from './utils/array';
import {
  assertProofValidity,
  isTransactionIdValid,
  computeLocalHash,
  ensureHashesEqual,
  ensureMerkleRootEqual,
  ensureValidReceipt,
  deriveIssuingAddressFromPublicKey,
  compareIssuingAddress
} from './inspectors';
import isMockChain from './helpers/isMockChain';
import type { IDidDocumentPublicKey } from '@decentralized-identity/did-common-typescript';

const { LinkedDataProof } = jsigs.suites;

export interface MerkleProof2019Options {
  explorerAPIs?: ExplorerAPI[];
  executeStepMethod?: (step: string, action: () => any, verificationSuite?: string, type?: string) => Promise<any>;
}

export interface VCDocument {
  proof: VCProof | VCProof[];
}

export interface MerkleProof2019API {
  options?: MerkleProof2019Options;
  issuer?: any; // TODO: define issuer type
  verificationMethod?: IDidDocumentPublicKey;
  document: VCDocument;
  proof?: VCProof;
  // the purpose of proof that the verifier will be used for, defaults to assertionMethod
  proofPurpose?: string;
  domain?: string | string[];
  challenge?: string;
}

export interface MerkleProof2019VerificationResult {
  verified: boolean;
  error?: string;
  verificationMethod: IDidDocumentPublicKey;
}

export interface MerkleProof2019VerifyProofAPI {
  documentLoader?: (url: string) => any; // jsonld document loader hook
  verifyIdentity?: boolean; // allow splitting verification process for more control
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
  public verificationMethod: IDidDocumentPublicKey = null;
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

    if (!document) {
      throw new Error('A document signed by MerkleProof2019 is required for the verification process.');
    }

    this.issuer = issuer;
    this.verificationMethod = verificationMethod;
    this.document = document;
    this.proofPurpose = proofPurpose;
    this.domain = Array.isArray(domain) ? domain : [domain];
    this.challenge = challenge;
    this.setProof(proof);
    this.setOptions(options);
    this.getChain();
    if (isMockChain(this.chain)) {
      this.adaptProofVerificationProcessToMocknet();
      this.adaptIdentityVerificationProcessToMocknet();
    }
  }

  static decodeMerkleProof2019 (proof: VCProof): DecodedProof {
    const base58Decoder = new Decoder(proof.proofValue);
    return base58Decoder.decode();
  }

  setProof (externalProof: VCProof = null): void {
    const proof = externalProof ?? this.document.proof;
    if (!proof) {
      throw new Error('The passed document is not signed.');
    }

    this.proof = proof as any; // TODO: might be an error if externalProof is not defined and document has multiproof
    this.proofValue = LDMerkleProof2019.decodeMerkleProof2019(this.proof);
  }

  async verifyProof ({ documentLoader, verifyIdentity }: MerkleProof2019VerifyProofAPI = {
    documentLoader: (url): any => {},
    verifyIdentity: true
  }): Promise<MerkleProof2019VerificationResult> {
    this.documentLoader = documentLoader;
    let verified: boolean;
    let error: string = '';

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
    this.identityVerificationProcess = [];
  }

  private setOptions (options: MerkleProof2019Options): void {
    this.explorerAPIs = options.explorerAPIs ?? [];
    if (options.executeStepMethod && typeof options.executeStepMethod === 'function') {
      this.executeStep = options.executeStepMethod;
    }
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

  private async compareIssuingAddress (): Promise<void> {
    await this.executeStep(
      'compareIssuingAddress',
      () => { compareIssuingAddress(this.getIssuerPublicKey(), this.derivedIssuingAddress); },
      this.type
    );
  }
}
