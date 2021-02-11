import sinon from 'sinon';
import jsonld from 'jsonld';
import JsonLdError from 'jsonld/lib/JsonLdError';
import blockcertsV3Fixture, { documentHash } from '../fixtures/blockcerts-v3';
import computeLocalHash from '../../src/inspectors/computeLocalHash';

describe('computeLocalHash test suite', function () {
  describe('given it receives a document', function () {
    it('should return the SHA-256 hashed version', async function () {
      const output = await computeLocalHash(blockcertsV3Fixture);
      expect(output).toBe(documentHash);
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
      const normalizeStub: sinon.SinonStub = sinon.stub(jsonld, 'normalize')
        .callsFake(
          function (fakeDoc: any, fakeArgs: any, cb: (err: JsonLdError, document: any) => any) {
            // https://github.com/standard/standard/issues/1352 silly people trying to be too smart
            // eslint-disable-next-line standard/no-callback-literal
            cb(mockJsonLdError, {});
          }
        );

      try {
        await computeLocalHash(blockcertsV3Fixture);
      } catch (e) {
        expect(e.message).toBe('Failed to normalize document');
        expect(e.name).toBe(mockJsonLdError.name);
        expect(e.details).toEqual(mockJsonLdError.details);
      }
      normalizeStub.restore();
    });
  });
});
