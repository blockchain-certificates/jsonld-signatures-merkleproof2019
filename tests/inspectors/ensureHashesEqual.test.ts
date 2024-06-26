import { describe, it, expect } from 'vitest';
import ensureHashesEqual from '../../src/inspectors/ensureHashesEqual';

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
    });
  });
});
