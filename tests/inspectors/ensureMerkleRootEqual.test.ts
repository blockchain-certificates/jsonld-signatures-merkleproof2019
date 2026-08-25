import { describe, it, expect } from 'vitest';
import ensureMerkleRootEqual from '../../src/inspectors/ensureMerkleRootEqual';
import { ProblemDetailsType } from '../../src/models/ProblemDetails';

describe('Inspectors test suite', function () {
  describe('ensureMerkleRootEqual method', function () {
    describe('given it is called with similar merkleRoot & remoteHash', function () {
      it('should not throw an error', function () {
        expect(function () {
          ensureMerkleRootEqual('similar', 'similar');
        }).not.toThrow();
      });
    });

    describe('given it is called with different merkleRoot & remoteHash', function () {
      it('should throw an error', function () {
        expect(function () {
          ensureMerkleRootEqual('merkle-root', 'remote-hash');
        }).toThrowError('Merkle root does not match remote hash.');
      });

      it('should expose the appropriate problemDetails', function () {
        try {
          ensureMerkleRootEqual('merkle-root', 'remote-hash');
          throw new Error('should not reach here');
        } catch (e) {
          expect(e.problemDetails).toEqual({
            type: ProblemDetailsType.CRYPTOGRAPHIC_SECURITY_ERROR,
            detail: 'Merkle root does not match remote hash.'
          });
        }
      });
    });
  });
});
