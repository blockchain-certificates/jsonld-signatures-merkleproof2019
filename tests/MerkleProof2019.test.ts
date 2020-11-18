import sinon from 'sinon';
import { MerkleProof2019, MerkleProof2019Options, MerkleProof2019VerificationResult } from '../src/MerkleProof2019';
import decodedProof, { assertionTransactionId } from './assertions/proof';
import { TransactionData } from '../src/models/TransactionData';
import { BLOCKCHAINS } from '../src/constants/blockchains';
import * as lookForTxFunctions from '../src/helpers/lookForTx';
import blockcertsV3Fixture, { documentHash } from './fixtures/blockcerts-v3';
import fixtureTransactionData from './fixtures/transactionData';

describe('MerkleProof2019 test suite', function () {
  describe('given a document is not passed', function () {
    it('should throw', function () {
      expect(() => {
        // eslint-disable-next-line no-new
        new MerkleProof2019({} as any);
      }).toThrow('A document signed by MerkleProof2019 is required for the verification process.');
    });
  });

  describe('given the document is not signed', function () {
    it('should throw', function () {
      const unsignedDocument = JSON.parse(JSON.stringify(blockcertsV3Fixture));
      delete unsignedDocument.proof;
      expect(() => {
        // eslint-disable-next-line no-new
        new MerkleProof2019({ document: unsignedDocument });
      }).toThrow('The passed document is not signed.');
    });
  });

  describe('given the document is not signed by MerkleProof2019', function () {
    it('should throw', function () {
      const unsignedDocument = JSON.parse(JSON.stringify(blockcertsV3Fixture));
      unsignedDocument.proof.type = 'Not merkle proof 2019';
      expect(() => {
        // eslint-disable-next-line no-new
        new MerkleProof2019({ document: unsignedDocument });
      }).toThrow('Incorrect proof type passed for verification. Expected: MerkleProof2019, Received: Not merkle proof 2019');
    });
  });

  describe('given a MerkleProof2019 signed document is passed', function () {
    let instance;

    beforeEach(function () {
      instance = new MerkleProof2019({ document: blockcertsV3Fixture });
    });

    afterEach(function () {
      instance = null;
    });

    it('registers the type of the proof', function () {
      expect(instance.type).toBe('MerkleProof2019');
    });

    describe('given the proof is set on the document', function () {
      it('decodes the CBOR encoded proofValue', function () {
        expect(instance.proof).toEqual(decodedProof);
      });
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
            parsingFunction: (): TransactionData => fixtureTransactionData
          }]
        };
        const instance = new MerkleProof2019({ options: fixtureOptions, document: blockcertsV3Fixture });
        expect(instance.explorerAPIs).toEqual(fixtureOptions.explorerAPIs);
      });
    });

    describe('verifyProof method', function () {
      describe('when the process is successful', function () {
        let result: MerkleProof2019VerificationResult;

        beforeEach(async function () {
          sinon.stub(lookForTxFunctions, 'default').resolves(fixtureTransactionData);
          result = await instance.verifyProof();
        });

        afterEach(function () {
          sinon.restore();
          result = null;
        });

        it('should retrieve the transaction id', function () {
          expect(instance.transactionId).toBe(assertionTransactionId);
        });

        it('should retrieve the transaction data', function () {
          expect(instance.txData).toEqual(fixtureTransactionData);
        });

        it('should compute the local document\'s hash', function () {
          expect(instance.localDocumentHash).toBe(documentHash);
        });

        it('should return the result object', function () {
          expect(result).toEqual({
            verified: true,
            error: ''
          });
        });
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
});
