import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
import sinon from 'sinon';
import type * as explorerLookup from '@blockcerts/explorer-lookup';
import { LDMerkleProof2019, type MerkleProof2019Options, type MerkleProof2019VerificationResult } from '../src';
import decodedProof, { assertionTransactionId } from './assertions/proof';
import { BLOCKCHAINS } from '@blockcerts/explorer-lookup';
import blockcertsV3Fixture, { documentHash } from './fixtures/testnet-v3-did';
import fixtureTransactionData from './fixtures/transactionData';

describe('MerkleProof2019 test suite', function () {
  describe('given the document is not signed', function () {
    it('should throw', function () {
      const unsignedDocument = JSON.parse(JSON.stringify(blockcertsV3Fixture));
      delete unsignedDocument.proof;
      expect(() => {
        new LDMerkleProof2019({ document: unsignedDocument });
      }).toThrow('The passed document is not signed.');
    });
  });

  describe('given a MerkleProof2019 signed document is passed', function () {
    let instance;

    beforeAll(function () {
      instance = new LDMerkleProof2019({ document: blockcertsV3Fixture });
    });

    it('registers the type of the proof', function () {
      expect(instance.type).toBe('MerkleProof2019');
    });

    describe('given the proof is set on the document', function () {
      it('decodes the CBOR encoded proofValue', function () {
        expect(instance.proofValue).toEqual(decodedProof);
      });
    });

    describe('given the options explorerAPIs is not set', function () {
      it('sets the explorerAPIs property as an empty array', function () {
        expect(instance.explorerAPIs).toEqual([]);
      });
    });

    it('should retrieve the chain', function () {
      expect(instance.chain).toEqual(BLOCKCHAINS.testnet);
    });

    describe('given the options explorerAPIs is set', function () {
      it('should set the certificate explorerAPIs property to the options explorerAPIs', function () {
        const fixtureOptions: MerkleProof2019Options = {
          explorerAPIs: [{
            serviceURL: 'https://explorer-example.com',
            priority: 0,
            parsingFunction: (): explorerLookup.TransactionData => fixtureTransactionData
          }]
        };
        const instance = new LDMerkleProof2019({ options: fixtureOptions, document: blockcertsV3Fixture });
        expect(instance.explorerAPIs).toEqual(fixtureOptions.explorerAPIs);
      });
    });

    describe('verifyProof method', function () {
      describe('when the process is successful', function () {
        let result: MerkleProof2019VerificationResult;

        beforeAll(async function () {
          vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
            const explorerLookup = await importOriginal();
            return {
              ...explorerLookup,
              lookForTx: () => fixtureTransactionData
            };
          });
          result = await instance.verifyProof();
        });

        afterAll(function () {
          vi.restoreAllMocks();
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
            verificationMethod: null,
            error: ''
          });
        });

        describe('and it is called with a documentLoader', function () {
          it('should call the documentLoader method', async function () {
            const stubLoader: sinon.SinonStub = sinon.stub().resolves(null);
            await instance.verifyProof({ documentLoader: stubLoader });
            expect(stubLoader.callCount > 0).toBe(true);
          });
        });

        describe('verifyIdentity flag', function () {
          let calledSteps = [];

          beforeEach(function () {
            const executeStepStub = async function (step, action): Promise<void> {
              calledSteps.push(step);
            };
            instance = new LDMerkleProof2019({
              document: blockcertsV3Fixture,
              verificationMethod: {
                id: 'did:example:1234#key',
                controller: 'did:example:1234',
                type: 'exampleMethod'
              },
              options: {
                executeStepMethod: executeStepStub
              }
            });
          });

          afterEach(function () {
            calledSteps = [];
          });

          describe('and the verifyIdentity flag is not specified', function () {
            it('should verify the identity by default', async function () {
              await instance.verifyProof();
              expect(calledSteps).toEqual([
                ...instance.getProofVerificationProcess(),
                ...instance.getIdentityVerificationProcess()
              ]);
            });
          });

          describe('and the verifyIdentity flag is set to false', function () {
            it('should not verify the identity automatically', async function () {
              await instance.verifyProof({ verifyIdentity: false });
              expect(calledSteps).toEqual([
                ...instance.getProofVerificationProcess()
              ]);
            });
          });
        });
      });
    });

    describe('validateTransactionId method', function () {
      describe('given the transaction id is valid', function () {
        it('should set the assertionTransactionId property', function () {
          instance.getTransactionId();
          expect(instance.transactionId).toBe(assertionTransactionId);
        });
      });

      describe('given the transaction id is invalid', function () {
        it('should throw', async function () {
          instance.proofValue = {
            anchors: [{ target: 'invalidDataFormat' }]
          };
          await expect(async () => {
            await instance.getTransactionId();
          }).rejects.toThrow('Could not retrieve transaction id as was provided an unexpected format');
        });
      });
    });
  });
});
