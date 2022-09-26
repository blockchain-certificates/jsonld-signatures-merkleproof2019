import sinon from 'sinon';
import jsonld from 'jsonld';
import JsonLdError from 'jsonld/lib/JsonLdError';
import blockcertsV3Fixture, { documentHash } from '../fixtures/testnet-v3-did';
import computeLocalHash from '../../src/inspectors/computeLocalHash';

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
      const normalizeStub: sinon.SinonStub = sinon.stub(jsonld, 'normalize')
        .callsFake(
          async function (fakeDoc: any, fakeArgs: any) {
            throw new JsonLdError(mockJsonLdError.message, mockJsonLdError.name, mockJsonLdError.details);
          }
        );

      try {
        await computeLocalHash(blockcertsV3Fixture);
      } catch (e) {
        expect(e.message).toBe('computeLocalHash - JSONLD normalization failed');
      }
      normalizeStub.restore();
    });
  });
});
