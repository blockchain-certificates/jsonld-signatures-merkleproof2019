import blockcertsV3Fixture, { documentHash } from '../fixtures/blockcerts-v3';
import computeLocalHash from '../../src/inspectors/computeLocalHash';

describe('computeLocalHash test suite', function () {
  describe('given it receives a document', function () {
    it('should return the SHA-256 hashed version', async function () {
      const output = await computeLocalHash(blockcertsV3Fixture);
      expect(output).toBe(documentHash);
    });
  });
});
