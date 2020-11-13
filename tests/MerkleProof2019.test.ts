import sinon from 'sinon';
import { MerkleProof2019, MerkleProof2019Options } from '../src/MerkleProof2019';
import fixtureProof from './fixtures/proof';
import decodedProof, { assertionTransactionId } from './assertions/proof';
import { TransactionData } from '../src/models/TransactionData';
import { BLOCKCHAINS } from '../src/constants/blockchains';
import * as lookForTxFunctions from '../src/helpers/lookForTx';
import blockcertsV3Fixture from './fixtures/blockcerts-v3';

describe('MerkleProof2019 test suite', function () {
  let instance;

  beforeEach(function () {
    instance = new MerkleProof2019({ proof: fixtureProof, document: blockcertsV3Fixture });
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

  describe('given the options explorerAPIs is not set', function () {
    it('sets the explorerAPIs property as an empty array', function () {
      expect(instance.explorerAPIs).toEqual([]);
    });
  });

  it('should retrieve the chain', function () {
    expect(instance.chain).toEqual(BLOCKCHAINS.ethropst);
  });

  describe('given the options explorerAPIs is set', function () {
    it('should set the certificate explorerAPIs property to the options explorerAPIs', function () {
      const fixtureOptions: MerkleProof2019Options = {
        explorerAPIs: [{
          serviceURL: 'https://explorer-example.com',
          priority: 0,
          parsingFunction: (): TransactionData => ({
            remoteHash: 'a',
            issuingAddress: 'b',
            time: 'c',
            revokedAddresses: ['d']
          })
        }]
      };
      const instance = new MerkleProof2019({ proof: fixtureProof, options: fixtureOptions });
      expect(instance.explorerAPIs).toEqual(fixtureOptions.explorerAPIs);
    });
  });

  describe('verifyProof method', function () {
    const fixtureTransactionData: TransactionData = {
      remoteHash: 'a',
      issuingAddress: 'b',
      time: 'c',
      revokedAddresses: ['d']
    };

    beforeEach(async function () {
      sinon.stub(lookForTxFunctions, 'default').resolves(fixtureTransactionData);
      await instance.verifyProof();
    });

    afterEach(function () {
      sinon.restore();
    });

    it('should retrieve the transaction id', function () {
      expect(instance.transactionId).toBe(assertionTransactionId);
    });

    it('should retrieve the transaction data', function () {
      expect(instance.txData).toEqual(fixtureTransactionData);
    });

    it('should compute the local document\'s hash', function () {
      expect(instance.localDocumentHash).toBe('5a44e794431569f4b50a44336c3d445085f09ac5785e38e133385fb486ada9c5');
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
