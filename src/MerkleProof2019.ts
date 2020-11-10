import { Decoder } from '@vaultie/lds-merkle-proof-2019';
import jsigs from 'jsonld-signatures';
import Proof from './models/Proof';
import getTransactionId from './helpers/getTransactionId';
import isTransactionIdValid from './inspectors/isTransactionIdValid';
import lookForTx from './helpers/lookForTx';
import { TDefaultExplorersPerBlockchain } from './explorers';
import { TExplorerFunctionsArray } from './explorers/explorer';
const { LinkedDataProof } = jsigs.suites;

export type TExplorerAPIs = TDefaultExplorersPerBlockchain & {
  custom?: TExplorerFunctionsArray;
};

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
  public proof: Proof = null;
  public blockcertsDocument: any = null; // TODO: define blockcertsDocument type

  private transactionId: string = '';

  constructor ({
    type = 'MerkleProof2019',
    issuer = null,
    verificationMethod = '',
    proof = null,
    blockcertsDocument = null
  } = {}) {
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

  private validateTransactionId (): string {
    this.transactionId = getTransactionId(this.proof);
    return isTransactionIdValid(this.transactionId);
  }

  private async fetchRemoteHash (): string {
    await lookForTx({
      transactionId: this.transactionId,
      chain: this.chain.code,
      explorerAPIs: this.explorerAPIs
    });
  }
}
