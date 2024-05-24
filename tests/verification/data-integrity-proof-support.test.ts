import { describe, it, expect } from 'vitest';
import fixture from '../fixtures/mocknet-vc-v2-data-integrity-proof.json';
import { LDMerkleProof2019 } from '../../src';

describe('given the documnet is signed following the DataIntegrityProof spec', function () {
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
});
