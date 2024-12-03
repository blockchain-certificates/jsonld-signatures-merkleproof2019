import { describe, it, expect } from 'vitest';
import fixture from '../fixtures/mocknet-vc-v2-data-integrity-proof.json';
import { LDMerkleProof2019 } from '../../src';
import fixtureIssuerProfile from '../fixtures/issuer-blockcerts.json';

describe('given the document is signed following the DataIntegrityProof spec', function () {
  describe('and is a valid MerkleProof2019 signature', function () {
    it('should verify successfully', async function () {
      const instance = new LDMerkleProof2019({
        document: fixture,
        proof: fixture.proof // merkle proof
      });
      const result = await instance.verifyProof();
      expect(result).toEqual({
        verified: true,
        verificationMethod: null,
        error: ''
      });
    });
  });

  describe('given the proofPurpose of the proof does not match the one of the verifier', function () {
    it('should throw an error', async function () {
      const instance = new LDMerkleProof2019({
        document: fixture,
        proof: fixture.proof,
        proofPurpose: 'authentication'
      });

      const result = await instance.verifyProof();
      expect(result).toEqual({
        verified: false,
        verificationMethod: null,
        error: 'Invalid proof purpose. Expected authentication but received assertionMethod'
      });
    });
  });

  describe('given the proofPurpose of the proof does not match the one of the issuer\'s key', function () {
    it('should throw an error', async function () {
      const instance = new LDMerkleProof2019({
        document: fixture,
        proof: {
          ...fixture.proof,
          proofPurpose: 'authentication'
        },
        proofPurpose: 'authentication',
        issuer: fixtureIssuerProfile
      });

      const result = await instance.verifyProof();
      expect(result).toEqual({
        verified: false,
        verificationMethod: null,
        error: 'The verification method https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json#key-1 is not allowed for the proof purpose authentication'
      });
    });
  });
});
