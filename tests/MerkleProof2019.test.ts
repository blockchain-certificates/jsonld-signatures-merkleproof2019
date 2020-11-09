import { MerkleProof2019 } from '../src/MerkleProof2019';
import fixtureProof from './fixtures/proof';
import decodedProof, { assertionTransactionId } from './assertions/proof';

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
    expect(instance.proof).toEqual(decodedProof);
  });

  describe('verifyProof method', function () {
    beforeEach(function () {
      instance.verifyProof();
    });

    it('should retrieve the transaction id', function () {
      expect(instance.transactionId).toBe(assertionTransactionId);
    });
  });

  describe('validateTransactionId method', function () {
    describe('given the transaction id is valid', function () {
      it('should set the assertionTransactionId property', function () {
        instance.validateTransactionId();
        expect(instance.transactionId).toBe(assertionTransactionId);
      });
    });

    describe('given the transaction id is invalid', function () {
      it('should throw', function () {
        instance.proof = {
          anchors: [{ target: 'invalidDataFormat' }]
        };
        expect(() => {
          instance.validateTransactionId();
        }).toThrow('Could not retrieve transaction id as was provided an unexpected format');
      });
    });
  });
});
