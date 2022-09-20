import { Decoder } from '@vaultie/lds-merkle-proof-2019';
import jsigs from 'jsonld-signatures';
import { lookForTx, ExplorerAPI, TransactionData } from '@blockcerts/explorer-lookup';
import { DecodedProof, JSONLDProof } from './models/Proof';
import getTransactionId from './helpers/getTransactionId';
import isTransactionIdValid from './inspectors/isTransactionIdValid';
import { IBlockchainObject } from './constants/blockchains';
import getChain from './helpers/getChain';
import computeLocalHash from './inspectors/computeLocalHash';
import ensureHashesEqual from './inspectors/ensureHashesEqual';
import ensureMerkleRootEqual from './inspectors/ensureMerkleRootEqual';
import type { IDidDocumentPublicKey } from '@decentralized-identity/did-common-typescript';
const { LinkedDataProof } = jsigs.suites;

export interface MerkleProof2019Options {
  explorerAPIs?: ExplorerAPI[];
}

export interface VCDocument {
  proof: JSONLDProof;
}

export interface MerkleProof2019API {
  options?: MerkleProof2019Options;
  issuer?: any; // TODO: define issuer type
  verificationMethod?: IDidDocumentPublicKey;
  document: VCDocument;
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
  public proof: DecodedProof = null;
  public document: VCDocument = null;
  public explorerAPIs: ExplorerAPI[] = [];
  public chain: IBlockchainObject;
  public txData: TransactionData;
  public localDocumentHash: string;

  private transactionId: string = '';

  constructor ({
    issuer = null,
    verificationMethod = null,
    document = null,
    options = {}
  }: MerkleProof2019API) {
    super({ type: 'MerkleProof2019' });

    if (!document) {
      throw new Error('A document signed by MerkleProof2019 is required for the verification process.');
    }

    this.issuer = issuer;
    this.verificationMethod = verificationMethod;
    this.document = document;
    this.setProof();
    this.setOptions(options);
    this.getChain();
  }

  setProof (): void {
    const { proof } = this.document;
    if (!proof) {
      throw new Error('The passed document is not signed.');
    }

    const base58Decoder = new Decoder(proof.proofValue);
    this.proof = base58Decoder.decode();
  }

  async verifyProof ({ documentLoader } = { documentLoader: (url): any => {} }): Promise<MerkleProof2019VerificationResult> {
    let verified: boolean;
    let error: string = '';
    try {
      this.validateTransactionId();
      await this.computeLocalHash(documentLoader);
      await this.fetchTransactionData();
      this.compareHashes();
      this.confirmMerkleRoot();
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

  private confirmMerkleRoot (): void {
    ensureMerkleRootEqual(this.proof.merkleRoot, this.txData.remoteHash);
  }

  private compareHashes (): void {
    ensureHashesEqual(this.localDocumentHash, this.proof.targetHash);
  }

  private async computeLocalHash (documentLoader): Promise<void> {
    this.localDocumentHash = await computeLocalHash(this.document, documentLoader);
  }

  private getChain (): void {
    this.chain = getChain(this.proof);
  }

  private setOptions (options: MerkleProof2019Options): void {
    this.explorerAPIs = options.explorerAPIs ?? [];
  }

  private validateTransactionId (): string {
    this.transactionId = getTransactionId(this.proof);
    return isTransactionIdValid(this.transactionId);
  }

  private async fetchTransactionData (): Promise<void> {
    this.txData = await lookForTx({
      transactionId: this.transactionId,
      chain: this.chain?.code,
      explorerAPIs: this.explorerAPIs
    });
  }
}
