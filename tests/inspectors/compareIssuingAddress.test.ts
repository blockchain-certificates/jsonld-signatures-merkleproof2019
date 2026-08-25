import { describe, it, expect } from 'vitest';
import { compareIssuingAddress } from '../../src/inspectors';
import { ProblemDetailsType } from '../../src/models/ProblemDetails';

describe('compareIssuingAddress inspector test suite', function () {
  describe('given the addresses to compare are identical', function () {
    it('should not throw', function () {
      const address = '1BKN1V5kfMsmqaoUjuBDyaPsch5AtyzuxJ';
      expect(() => {
        compareIssuingAddress(address, address);
      }).not.toThrow();
    });
  });

  describe('given the addresses to compare are not identical', function () {
    it('should throw', function () {
      const address = '1BKN1V5kfMsmqaoUjuBDyaPsch5AtyzuxJ';
      const mismatchAddress = '1AtotvncxDXbXJDu4ekpinePkrohDwRkMi';
      expect(() => {
        compareIssuingAddress(address, mismatchAddress);
      }).toThrow('Issuer identity mismatch - The provided verification method does not match the issuer identity');
    });

    it('should expose the appropriate problemDetails', function () {
      const address = '1BKN1V5kfMsmqaoUjuBDyaPsch5AtyzuxJ';
      const mismatchAddress = '1AtotvncxDXbXJDu4ekpinePkrohDwRkMi';
      try {
        compareIssuingAddress(address, mismatchAddress);
        throw new Error('should not reach here');
      } catch (e) {
        expect(e.problemDetails).toEqual({
          type: ProblemDetailsType.CRYPTOGRAPHIC_SECURITY_ERROR,
          detail: 'Issuer identity mismatch - The provided verification method does not match the issuer identity'
        });
      }
    });
  });
});
