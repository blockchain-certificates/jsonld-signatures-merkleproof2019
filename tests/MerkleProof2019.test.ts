import { MerkleProof2019 } from '../src/MerkleProof2019';
import fixtureProof from './fixtures/proof';
import assertionProof from './assertions/proof';

describe('MerkleProof2019 test suite', function () {
  let instance;

  beforeEach(function () {
    instance = new MerkleProof2019({ proof: fixtureProof });
  });

  afterEach(function () {
    instance = null;
  });

  it('registers the type of the proof', function () {
    expect(instance.type).toBe('MerkleProof2019');
  });

  it('decodes the CBOR encoded proofValue', function () {
    expect(instance.proof).toEqual(assertionProof);
  });
});
