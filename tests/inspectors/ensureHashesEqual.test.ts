import { describe, it, expect } from 'vitest';
import ensureHashesEqual from '../../src/inspectors/ensureHashesEqual';
import { ProblemDetailsType } from '../../src/models/ProblemDetails';

describe('Inspectors test suite', function () {
  describe('ensureHashesEqual method', function () {
    const errorMessage = 'Computed hash does not match remote hash';

    describe('given it is called with two similar hashes', function () {
      it('should not throw an error', function () {
        const hash = 'hash';
        expect(ensureHashesEqual(hash, hash)).toBe(true);
      });
    });

    describe('given it is called with two different hashes', function () {
      it('should throw an error', function () {
        expect(function () {
          ensureHashesEqual('hash', 'different-hash');
        }).toThrowError(errorMessage);
      });

      it('should expose the appropriate problemDetails', function () {
        try {
          ensureHashesEqual('hash', 'different-hash');
          throw new Error('should not reach here');
        } catch (e) {
          expect(e.problemDetails).toEqual({
            type: ProblemDetailsType.CRYPTOGRAPHIC_SECURITY_ERROR,
            detail: errorMessage
          });
        }
      });
    });
  });
});
