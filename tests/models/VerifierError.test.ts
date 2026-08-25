import { describe, it, expect } from 'vitest';
import VerifierError from '../../src/models/VerifierError';
import { ProblemDetailsType } from '../../src/models/ProblemDetails';

describe('VerifierError test suite', function () {
  describe('given no problemDetailsType is provided', function () {
    it('should not set the problemDetails property', function () {
      const error = new VerifierError('someStep', 'some message');
      expect(error.stepCode).toBe('someStep');
      expect(error.message).toBe('some message');
      expect(error.problemDetails).toBeUndefined();
    });
  });

  describe('given a problemDetailsType is provided', function () {
    it('should set the problemDetails property accordingly', function () {
      const error = new VerifierError('someStep', 'some message', ProblemDetailsType.MALFORMED_VALUE_ERROR);
      expect(error.stepCode).toBe('someStep');
      expect(error.message).toBe('some message');
      expect(error.problemDetails).toEqual({
        type: ProblemDetailsType.MALFORMED_VALUE_ERROR,
        detail: 'some message'
      });
    });
  });

  describe('given the error is thrown and caught', function () {
    it('should be an instance of Error and expose problemDetails', function () {
      try {
        throw new VerifierError('someStep', 'some message', ProblemDetailsType.CRYPTOGRAPHIC_SECURITY_ERROR);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e).toBeInstanceOf(VerifierError);
        expect(e.problemDetails.type).toBe(ProblemDetailsType.CRYPTOGRAPHIC_SECURITY_ERROR);
      }
    });
  });
});
