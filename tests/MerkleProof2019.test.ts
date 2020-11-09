import { MerkleProof2019 } from '../src/MerkleProof2019';
import fixtureProof from './fixtures/proof';

describe('MerkleProof2019 test suite', function () {
  it('works', function () {
    const instance = new MerkleProof2019({ proof: fixtureProof });
    expect(instance.type).toBe('MerkleProof2019');
  });
});
