import { describe, it, expect } from 'vitest';
import sinon from 'sinon';
import jsonld from 'jsonld';
import JsonLdError from 'jsonld/lib/JsonLdError';
import blockcertsV3Fixture, { documentHash } from '../fixtures/testnet-v3-did';
import blockcertsV3CustomContextFixture, { blockcertsV3CustomContextHash } from '../fixtures/testnet-v3-custom-context';
import computeLocalHash from '../../src/inspectors/computeLocalHash';
import { ProblemDetailsType } from '../../src/models/ProblemDetails';

describe('computeLocalHash test suite', function () {
  describe('given it receives a document', function () {
    it('should return the SHA-256 hashed version', async function () {
      const output = await computeLocalHash(blockcertsV3Fixture);
      expect(output).toBe(documentHash);
    });
  });

  describe('given it is provided with a documentLoader', function () {
    it('should call the documentLoader', async function () {
      const stubLoader = sinon.stub().resolves(null);
      await computeLocalHash(blockcertsV3Fixture, null, stubLoader);
      expect(stubLoader.callCount > 0).toBe(true);
    });
  });

  describe('given the normalization of the document fails', function () {
    it('should reject with an error', async function () {
      const mockJsonLdError: JsonLdError = {
        message: 'Failed',
        name: 'jsonld.InvalidUrl',
        details: {
          code: 'loading document failed',
          url: 'https://blockcerts.org/credentials/v1',
          httpStatusCode: 404
        }
      };
      const normalizeStub: sinon.SinonStub = sinon.stub((jsonld as any), 'normalize')
        .callsFake(
          async function (fakeDoc: any, fakeArgs: any) {
            throw new JsonLdError(mockJsonLdError.message, mockJsonLdError.name, mockJsonLdError.details);
          }
        );

      try {
        await computeLocalHash(blockcertsV3Fixture);
        throw new Error('should not reach here');
      } catch (e) {
        expect(e.message).toBe('Failed JSON-LD normalization');
        expect(e.problemDetails).toEqual({
          type: ProblemDetailsType.PROOF_TRANSFORMATION_ERROR,
          detail: 'Failed JSON-LD normalization'
        });
      }
      normalizeStub.restore();
    });
  });

  describe('given the document has a custom context', function () {
    it('should normalize and hash the document as expected', async function () {
      const output = await computeLocalHash(blockcertsV3CustomContextFixture);
      expect(output).toBe(blockcertsV3CustomContextHash);
    });
  });

  describe('given the document has an array of proofs but no target proof was specified', function () {
    it('should throw an error with the appropriate problemDetails', async function () {
      const document = {
        ...blockcertsV3Fixture,
        proof: [{ proofValue: 'proof-a' }, { proofValue: 'proof-b' }]
      };

      try {
        await computeLocalHash(document);
        throw new Error('should not reach here');
      } catch (e) {
        expect(e.message).toBe('Document proof is an array but no target proof was specified to know what to verify.');
        expect(e.problemDetails).toEqual({
          type: ProblemDetailsType.MALFORMED_VALUE_ERROR,
          detail: 'Document proof is an array but no target proof was specified to know what to verify.'
        });
      }
    });
  });

  describe('given the normalized document contains unmapped fields', function () {
    it('should throw an error with the appropriate problemDetails', async function () {
      const document = {
        ...blockcertsV3Fixture,
        unmappedField: 'some-value'
      };

      try {
        await computeLocalHash(document);
        throw new Error('should not reach here');
      } catch (e) {
        expect(e.message).toContain('Found unmapped fields during JSON-LD normalization');
        expect(e.problemDetails.type).toBe(ProblemDetailsType.MALFORMED_VALUE_ERROR);
        expect(e.problemDetails.detail).toContain('Found unmapped fields during JSON-LD normalization');
      }
    });
  });
});
