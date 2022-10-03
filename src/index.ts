import { Decoder } from '@vaultie/lds-merkle-proof-2019';
import jsigs from 'jsonld-signatures';
import { lookForTx, ExplorerAPI, TransactionData } from '@blockcerts/explorer-lookup';
import { DecodedProof, VCProof } from './models/Proof';
import getTransactionId from './helpers/getTransactionId';
import parseIssuerKeys from './helpers/parseIssuerKeys';
import getChain from './helpers/getChain';
import {
  ensureValidIssuingKey,
  isTransactionIdValid,
  computeLocalHash,
  ensureHashesEqual,
  ensureMerkleRootEqual, ensureValidReceipt
} from './inspectors';
import type { IDidDocumentPublicKey } from '@decentralized-identity/did-common-typescript';
import type { IBlockchainObject } from './constants/blockchains';
import type { IssuerPublicKeyList } from './models/Issuer';

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
}

export interface MerkleProof2019VerificationResult {
  verified: boolean;
  error?: string;
  verificationMethod: IDidDocumentPublicKey;
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
  public type: string = 'MerkleProof2019';
  public issuer: any = null; // TODO: define issuer type
  public verificationMethod: IDidDocumentPublicKey = null;
  public proof: VCProof = null;
  public proofValue: DecodedProof = null;
  public document: VCDocument = null;
  public explorerAPIs: ExplorerAPI[] = [];
  public chain: IBlockchainObject;
  public txData: TransactionData;
  public localDocumentHash: string;
  public issuerPublicKeyList: IssuerPublicKeyList;
  public documentLoader = null;
  public proofVerificationProcess = [
    'getTransactionId',
    'computeLocalHash',
    'fetchRemoteHash',
    'compareHashes',
    'checkMerkleRoot',
    'checkReceipt'
  ];

  private transactionId: string = '';

  constructor ({
    issuer = null,
    verificationMethod = null,
    document = null,
    proof = null,
    options = {}
  }: MerkleProof2019API) {
    super({ type: 'MerkleProof2019' });

    if (!document) {
      throw new Error('A document signed by MerkleProof2019 is required for the verification process.');
    }

    this.issuer = issuer;
    this.verificationMethod = verificationMethod;
    this.document = document;
    this.setProof(proof);
    this.setOptions(options);
    this.getChain();
  }

  setProof (externalProof: VCProof = null): void {
    const proof = externalProof ?? this.document.proof;
    if (!proof) {
      throw new Error('The passed document is not signed.');
    }

    this.proof = proof as any; // TODO: might be an error if externalProof is not defined and document has multiproof
    const base58Decoder = new Decoder((proof as any).proofValue);
    this.proofValue = base58Decoder.decode();
  }

  async verifyProof ({ documentLoader } = { documentLoader: (url): any => {} }): Promise<MerkleProof2019VerificationResult> {
    this.documentLoader = documentLoader;
    let verified: boolean;
    let error: string = '';
    try {
      for (const verificationStep of this.proofVerificationProcess) {
        if (!this[verificationStep]) {
          console.error('verification logic for', verificationStep, 'not implemented');
          return;
        }
        await this[verificationStep]();
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

  getProofVerificationProcess (): string[] {
    return this.proofVerificationProcess;
  }

  getIssuerPublicKey (): string {
    return this.getTxData()?.issuingAddress ?? '';
  }

  getIssuanceTime (): string {
    return this.getTxData()?.time as string ?? '';
  }

  private getTxData (): TransactionData {
    if (!this.txData) {
      console.error('Trying to access issuing address when txData not available yet. Did you run the `verify` method yet?');
      return null;
    }

    return this.txData;
  }

  private getChain (): void {
    this.chain = getChain(this.proofValue);
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

  private async checkAuthenticity (): Promise<void> {
    await this.executeStep(
      'checkAuthenticity',
      () => ensureValidIssuingKey(this.issuerPublicKeyList, this.txData.issuingAddress, this.txData.time),
      this.type
    );
  }

  private async parseIssuerKeys (): Promise<void> {
    this.issuerPublicKeyList = await this.executeStep(
      'parseIssuerKeys',
      () => parseIssuerKeys(this.issuer),
      this.type
    );
  }

  private async checkReceipt (): Promise<void> {
    await this.executeStep(
      'checkReceipt',
      () => ensureValidReceipt(this.proofValue),
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
}
