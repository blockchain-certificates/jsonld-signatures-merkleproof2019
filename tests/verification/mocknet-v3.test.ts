import { describe, it, expect } from 'vitest';
import fixture from '../fixtures/mocknet-v3';
import { LDMerkleProof2019 } from '../../src';

describe('Given the test chain is Mocknet', function () {
  describe('when the certificate is valid', function () {
    it('should verify successfully', async function () {
      const instance = new LDMerkleProof2019({
        document: fixture,
        proof: fixture.proof[1] // merkle proof
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
