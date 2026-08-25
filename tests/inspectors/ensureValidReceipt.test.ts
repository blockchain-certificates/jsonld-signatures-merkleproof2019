import { describe, it, expect } from 'vitest';
import ensureValidReceipt from '../../src/inspectors/ensureValidReceipt';
import { ProblemDetailsType } from '../../src/models/ProblemDetails';
import type { DecodedProof } from '../../src/models/Proof';

describe('ensureValidReceipt test suite', function () {
  describe('given the receipt path is malformed (a node has neither left nor right)', function () {
    it('should throw with the appropriate problemDetails', function () {
      const receipt: DecodedProof = {
        anchors: [],
        merkleRoot: 'merkle-root',
        targetHash: 'target-hash',
        path: [{} as any]
      };

      try {
        ensureValidReceipt(receipt);
        throw new Error('should not reach here');
      } catch (e) {
        expect(e.message).toBe('The receipt is malformed. There was a problem navigating the merkle tree in the receipt.');
        expect(e.problemDetails).toEqual({
          type: ProblemDetailsType.CRYPTOGRAPHIC_SECURITY_ERROR,
          detail: 'The receipt is malformed. There was a problem navigating the merkle tree in the receipt.'
        });
      }
    });
  });

  describe('given the computed proof hash does not match the merkle root', function () {
    it('should throw with the appropriate problemDetails', function () {
      const receipt: DecodedProof = {
        anchors: [],
        merkleRoot: 'expected-merkle-root',
        targetHash: 'target-hash',
        path: []
      };

      try {
        ensureValidReceipt(receipt);
        throw new Error('should not reach here');
      } catch (e) {
        expect(e.message).toBe('Invalid Merkle Receipt. Proof hash did not match Merkle root');
        expect(e.problemDetails).toEqual({
          type: ProblemDetailsType.CRYPTOGRAPHIC_SECURITY_ERROR,
          detail: 'Invalid Merkle Receipt. Proof hash did not match Merkle root'
        });
      }
    });
  });

  describe('given a valid receipt', function () {
    it('should not throw', function () {
      const receipt: DecodedProof = {
        anchors: [],
        merkleRoot: 'target-hash',
        targetHash: 'target-hash',
        path: []
      };

      expect(() => {
        ensureValidReceipt(receipt);
      }).not.toThrow();
    });
  });
});
