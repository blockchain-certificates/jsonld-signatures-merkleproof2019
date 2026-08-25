import { describe, it, expect } from 'vitest';
import assertProofValidity from '../../src/inspectors/assertProofValidity';
import { ProblemDetailsType } from '../../src/models/ProblemDetails';
import type { VCProof } from '../../src/models/Proof';

describe('assertProofValidity test suite', function () {
  const baseProof: VCProof = {
    type: 'MerkleProof2019',
    created: '2022-03-08T12:20:39.213837',
    proofPurpose: 'assertionMethod',
    verificationMethod: 'did:example:issuer#key-1'
  };

  describe('given the proof has no proofPurpose', function () {
    it('should throw with the appropriate problemDetails', function () {
      const proof = { ...baseProof };
      delete proof.proofPurpose;

      expect(() => {
        assertProofValidity({
          expectedProofPurpose: 'assertionMethod',
          expectedDomain: [],
          expectedChallenge: '',
          proof,
          issuer: null
        });
      }).toThrow('`proofPurpose` property is missing from proof');

      try {
        assertProofValidity({
          expectedProofPurpose: 'assertionMethod',
          expectedDomain: [],
          expectedChallenge: '',
          proof,
          issuer: null
        });
        throw new Error('should not reach here');
      } catch (e) {
        expect(e.problemDetails).toEqual({
          type: ProblemDetailsType.MALFORMED_VALUE_ERROR,
          detail: '`proofPurpose` property is missing from proof'
        });
      }
    });
  });

  describe('given the proof has no created property', function () {
    it('should throw with the appropriate problemDetails', function () {
      const proof = { ...baseProof };
      delete proof.created;

      try {
        assertProofValidity({
          expectedProofPurpose: 'assertionMethod',
          expectedDomain: [],
          expectedChallenge: '',
          proof,
          issuer: null
        });
        throw new Error('should not reach here');
      } catch (e) {
        expect(e.message).toBe('`created` property is missing from proof');
        expect(e.problemDetails).toEqual({
          type: ProblemDetailsType.MALFORMED_VALUE_ERROR,
          detail: '`created` property is missing from proof'
        });
      }
    });
  });

  describe('given the proofPurpose does not match the expected one', function () {
    it('should throw with the appropriate problemDetails', function () {
      try {
        assertProofValidity({
          expectedProofPurpose: 'authentication',
          expectedDomain: [],
          expectedChallenge: '',
          proof: baseProof,
          issuer: null
        });
        throw new Error('should not reach here');
      } catch (e) {
        expect(e.message).toBe('Invalid proof purpose. Expected authentication but received assertionMethod');
        expect(e.problemDetails).toEqual({
          type: ProblemDetailsType.MALFORMED_VALUE_ERROR,
          detail: 'Invalid proof purpose. Expected authentication but received assertionMethod'
        });
      }
    });
  });

  describe('given the proof verification method is not allowed for the expected proof purpose', function () {
    it('should throw with the appropriate problemDetails', function () {
      const issuer = {
        assertionMethod: ['did:example:issuer#other-key']
      };

      try {
        assertProofValidity({
          expectedProofPurpose: 'assertionMethod',
          expectedDomain: [],
          expectedChallenge: '',
          proof: baseProof,
          issuer
        });
        throw new Error('should not reach here');
      } catch (e) {
        expect(e.message).toBe('The verification method did:example:issuer#key-1 is not allowed for the proof purpose assertionMethod');
        expect(e.problemDetails).toEqual({
          type: ProblemDetailsType.CRYPTOGRAPHIC_SECURITY_ERROR,
          detail: 'The verification method did:example:issuer#key-1 is not allowed for the proof purpose assertionMethod'
        });
      }
    });
  });

  describe('given the proof domain does not match the expected domain', function () {
    it('should throw with the appropriate problemDetails', function () {
      const proof = { ...baseProof, domain: 'other-domain.com' };

      try {
        assertProofValidity({
          expectedProofPurpose: 'assertionMethod',
          expectedDomain: ['example.com'],
          expectedChallenge: '',
          proof,
          issuer: null
        });
        throw new Error('should not reach here');
      } catch (e) {
        expect(e.message).toBe('The proof is not authorized for this domain');
        expect(e.problemDetails).toEqual({
          type: ProblemDetailsType.MALFORMED_VALUE_ERROR,
          detail: 'The proof is not authorized for this domain'
        });
      }
    });
  });

  describe('given the proof challenge does not match the expected challenge', function () {
    it('should throw with the appropriate problemDetails', function () {
      const proof = { ...baseProof, domain: 'example.com', challenge: 'other-challenge' };

      try {
        assertProofValidity({
          expectedProofPurpose: 'assertionMethod',
          expectedDomain: ['example.com'],
          expectedChallenge: 'expected-challenge',
          proof,
          issuer: null
        });
        throw new Error('should not reach here');
      } catch (e) {
        expect(e.message).toBe('The proof\'s challenge does not match the verifier\'s challenge');
        expect(e.problemDetails).toEqual({
          type: ProblemDetailsType.MALFORMED_VALUE_ERROR,
          detail: 'The proof\'s challenge does not match the verifier\'s challenge'
        });
      }
    });
  });

  describe('given a valid proof', function () {
    it('should not throw', function () {
      expect(() => {
        assertProofValidity({
          expectedProofPurpose: 'assertionMethod',
          expectedDomain: [],
          expectedChallenge: '',
          proof: baseProof,
          issuer: null
        });
      }).not.toThrow();
    });
  });
});
