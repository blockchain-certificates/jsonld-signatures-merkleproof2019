import { Decoder } from '@vaultie/lds-merkle-proof-2019';
import jsigs from 'jsonld-signatures';
import { DecodedProof, JSONLDProof } from './models/Proof';
import getTransactionId from './helpers/getTransactionId';
import isTransactionIdValid from './inspectors/isTransactionIdValid';
import lookForTx, { prepareExplorerAPIs } from './helpers/lookForTx';
import { ExplorerAPI } from './models/Explorers';
import { IBlockchainObject } from './constants/blockchains';
import getChain from './helpers/getChain';
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
  blockcertsDocument?: any; // TODO: define blockcertsDocument type
}

export class MerkleProof2019 extends LinkedDataProof {
  /**
   * @param type {string} Provided by subclass.
   * @param [issuer] {string} A key id URL to the paired public key.
   * @param [verificationMethod] {string} A key id URL to the paired public key.
   * @param [proof] {object} a JSON-LD document with options to use for
   *   the `proof` node (e.g. any other custom fields can be provided here
   *   using a context different from security-v2).
   * @param [blockcertsDocument] {BlockcertsV3 document} document used and signed by the MerkleProof2019 signature
   */
  public type: string = 'MerkleProof2019';
  public issuer: any = null; // TODO: define issuer type
  public verificationMethod: string = '';
  public proof: DecodedProof = null;
  public blockcertsDocument: any = null; // TODO: define blockcertsDocument type
  public explorerAPIs: ExplorerAPI[] = [];
  public chain: IBlockchainObject;

  private transactionId: string = '';

  constructor ({
    type = 'MerkleProof2019',
    issuer = null,
    verificationMethod = '',
    proof = null,
    blockcertsDocument = null,
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
    this.blockcertsDocument = blockcertsDocument;
    this.setOptions(options);
    this.getChain();
  }

  async verifyProof (): Promise<any> { // TODO: define return type
    this.validateTransactionId();
    const verificationStatus = {} as any;
    const verified = verificationStatus.status === 'success';
    return {
      verified,
      verificationStatus
    };
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

  private async fetchRemoteHash (): Promise<void> {
    await lookForTx({
      transactionId: this.transactionId,
      chain: this.chain.code,
      explorerAPIs: prepareExplorerAPIs(this.explorerAPIs)
    });
  }
}
