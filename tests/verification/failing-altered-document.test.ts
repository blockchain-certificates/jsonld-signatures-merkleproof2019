import sinon from 'sinon';
import alteredBlockcertsV3Fixture from '../fixtures/altered-blockcerts-v3';
import { MerkleProof2019, MerkleProof2019VerificationResult } from '../../src/MerkleProof2019';
import * as lookForTxFunctions from '../../src/helpers/lookForTx';
import fixtureTransactionData from '../fixtures/transactionData';

describe('when the process fails', function () {
  let instance;

  beforeEach(function () {
    instance = new MerkleProof2019({ document: alteredBlockcertsV3Fixture });
    sinon.stub(lookForTxFunctions, 'default').resolves(fixtureTransactionData);
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
        error: 'Remote hash does not match verified document.'
      });
    });
  });
});
