import blockcertsV3Fixture from '../fixtures/blockcerts-v3';
import computeLocalHash from '../../src/inspectors/computeLocalHash';

describe('computeLocalHash test suite', function () {
  describe('given it receives a document', function () {
    it('should return the SHA-256 hashed version', async function () {
      const output = await computeLocalHash(blockcertsV3Fixture);
      expect(output).toBe('5a44e794431569f4b50a44336c3d445085f09ac5785e38e133385fb486ada9c5');
    });
  });
});
