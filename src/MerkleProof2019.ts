import { Certificate } from '@blockcerts/cert-verifier-js/lib';
import { Decoder } from '@vaultie/lds-merkle-proof-2019';
import jsigs from 'jsonld-signatures';
const { LinkedDataProof } = jsigs.suites;

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
  public proof: any = null; // TODO: define proof type
  public blockcertsCertificate: any = null;

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
    this.blockcertsCertificate = new Certificate(blockcertsDocument);
  }

  async verifyProof (): Promise<any> { // TODO: define return type
    const verificationStatus = await this.blockcertsCertificate.verify();
    const verified = verificationStatus.status === 'success';
    return {
      verified,
      verificationStatus
    };
  }
}
