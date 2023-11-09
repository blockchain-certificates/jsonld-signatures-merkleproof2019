import sinon from 'sinon';
import * as explorerLookup from '@blockcerts/explorer-lookup';
import alteredBlockcertsV3Fixture from '../fixtures/altered-blockcerts-v3';
import { LDMerkleProof2019, type MerkleProof2019VerificationResult } from '../../src';
import fixtureTransactionData from '../fixtures/transactionData';

describe('when the process fails', function () {
  let instance;

  beforeEach(function () {
    instance = new LDMerkleProof2019({ document: alteredBlockcertsV3Fixture });
    sinon.stub(explorerLookup, 'lookForTx').resolves(fixtureTransactionData);
  });

  afterEach(function () {
    instance = null;
    sinon.restore();
  });

  describe('given the local hash does not match the remote hash', function () {
    it('should return the error', async function () {
      const result: MerkleProof2019VerificationResult = await instance.verifyProof();
      expect(result).toEqual({
        verified: false,
        verificationMethod: null,
        error: 'Computed hash does not match remote hash'
      });
    });
  });
});
