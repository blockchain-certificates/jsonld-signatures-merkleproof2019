import { Decoder } from '@vaultie/lds-merkle-proof-2019';
import jsigs from 'jsonld-signatures';
import { DecodedProof, JSONLDProof } from './models/Proof';
import getTransactionId from './helpers/getTransactionId';
import isTransactionIdValid from './inspectors/isTransactionIdValid';
import lookForTx, { prepareExplorerAPIs } from './helpers/lookForTx';
import { ExplorerAPI } from './models/Explorers';
import { IBlockchainObject } from './constants/blockchains';
import getChain from './helpers/getChain';
import { TransactionData } from './models/TransactionData';
import computeLocalHash from './inspectors/computeLocalHash';
import ensureHashesEqual from './inspectors/ensureHashesEqual';
import ensureMerkleRootEqual from './inspectors/ensureMerkleRootEqual';
const { LinkedDataProof } = jsigs.suites;

export interface MerkleProof2019Options {
  explorerAPIs?: ExplorerAPI[];
}

export interface MerkleProof2019API {
  options?: MerkleProof2019Options;
  type?: 'MerkleProof2019';
  issuer?: any; // TODO: define issuer type
  proof: JSONLDProof;
  verificationMethod?: string;
  document?: any; // TODO: define document type
}

export class MerkleProof2019 extends LinkedDataProof {
  /**
   * @param type {string} Provided by subclass.
   * @param [issuer] {string} A key id URL to the paired public key.
   * @param [verificationMethod] {string} A key id URL to the paired public key.
   * @param [proof] {object} a JSON-LD document with options to use for
   *   the `proof` node (e.g. any other custom fields can be provided here
   *   using a context different from security-v2).
   * @param [document] {document} document used and signed by the MerkleProof2019 signature
   */
  public type: string = 'MerkleProof2019';
  public issuer: any = null; // TODO: define issuer type
  public verificationMethod: string = '';
  public proof: DecodedProof = null;
  public document: any = null; // TODO: define document type
  public explorerAPIs: ExplorerAPI[] = [];
  public chain: IBlockchainObject;
  public txData: TransactionData;
  public localDocumentHash: string;

  private transactionId: string = '';

  constructor ({
    type = 'MerkleProof2019',
    issuer = null,
    verificationMethod = '',
    proof = null,
    document = null,
    options = {}
  }: MerkleProof2019API) {
    super({ type });
    // validate common options
    if (verificationMethod !== undefined &&
      typeof verificationMethod !== 'string') {
      throw new TypeError('"verificationMethod" must be a URL string.');
    }
    this.issuer = issuer;
    this.verificationMethod = verificationMethod;
    const base58Decoder = new Decoder(proof.proofValue);
    this.proof = base58Decoder.decode();
    this.document = document;
    this.setOptions(options);
    this.getChain();
  }

  async verifyProof (): Promise<any> { // TODO: define return type
    this.validateTransactionId();
    await this.computeLocalHash();
    await this.fetchTransactionData();
    this.compareHashes();
    this.confirmMerkleRoot();
    const verificationStatus = {} as any;
    const verified = verificationStatus.status === 'success';
    return {
      verified,
      verificationStatus
    };
  }

  private confirmMerkleRoot (): void {
    ensureMerkleRootEqual(this.proof.merkleRoot, this.txData.remoteHash);
  }

  private compareHashes (): void {
    ensureHashesEqual(this.localDocumentHash, this.proof.targetHash);
  }

  private async computeLocalHash (): Promise<void> {
    this.localDocumentHash = await computeLocalHash(this.document);
  }

  private getChain (): void {
    this.chain = getChain(this.proof);
  }

  private setOptions (options: MerkleProof2019Options): void {
    this.explorerAPIs = options.explorerAPIs || [];
  }

  private validateTransactionId (): string {
    this.transactionId = getTransactionId(this.proof);
    return isTransactionIdValid(this.transactionId);
  }

  private async fetchTransactionData (): Promise<void> {
    this.txData = await lookForTx({
      transactionId: this.transactionId,
      chain: this.chain.code,
      explorerAPIs: prepareExplorerAPIs(this.explorerAPIs)
    });
  }
}
