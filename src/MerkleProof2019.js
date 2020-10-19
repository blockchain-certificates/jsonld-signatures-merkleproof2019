'use strict';
const jsigs = require('jsonld-signatures');
const { Certificate } = require('@blockcerts/cert-verifier-js/lib');
const { LinkedDataProof } = jsigs.suites;

module.exports = class MerkleProof2019 extends LinkedDataProof {
  /**
   * @param type {string} Provided by subclass.
   *
   * One of these parameters is required to use a suite for signing:
   *
   * @param [creator] {string} A key id URL to the paired public key.
   * @param [verificationMethod] {string} A key id URL to the paired public key.
   *
   * Advanced optional parameters and overrides:
   *
   * @param [proof] {object} a JSON-LD document with options to use for
   *   the `proof` node (e.g. any other custom fields can be provided here
   *   using a context different from security-v2).
   * @param [date] {string|Date} signing date to use if not passed.
   * @param [useNativeCanonize] {boolean} true to use a native canonize
   *   algorithm.
   * @param [blockcertsDocument] {BlockcertsV3 document} document used and signed by the MerkleProof2019 signature
   */
  constructor({
                type = 'MerkleProof2019', creator, verificationMethod, proof, date,
                useNativeCanonize, blockcertsDocument} = {}) {
    // validate common options
    if(verificationMethod !== undefined &&
      typeof verificationMethod !== 'string') {
      throw new TypeError('"verificationMethod" must be a URL string.');
    }
    super({type});
    this.creator = creator;
    this.verificationMethod = verificationMethod;
    this.proof = proof;
    this.blockcertsCertificate = new Certificate(blockcertsDocument);
    if(date !== undefined) {
      this.date = new Date(date);
      if(isNaN(this.date)) {
        throw TypeError(`"date" "${date}" is not a valid date.`);
      }
    }
  }

  async verifyProof () {
    const verificationStatus = await this.blockcertsCertificate.verify();
    const verified = verificationStatus.status === 'success';
    return {
      verified,
      verificationStatus
    };
  }
};
