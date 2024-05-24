import { describe, it, expect, vi } from 'vitest';
import alteredBlockcertsV3Fixture from '../fixtures/altered-blockcerts-v3';
import { LDMerkleProof2019, type MerkleProof2019VerificationResult } from '../../src';
import fixtureTransactionData from '../fixtures/transactionData';

describe('when the process fails', function () {
  describe('given the local hash does not match the remote hash', function () {
    it('should return the error', async function () {
      vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
        const explorerLookup = await importOriginal();
        return {
          ...explorerLookup,
          lookForTx: () => fixtureTransactionData
        };
      });
      const instance = new LDMerkleProof2019({ document: alteredBlockcertsV3Fixture });
      const result: MerkleProof2019VerificationResult = await instance.verifyProof();
      expect(result).toEqual({
        verified: false,
        verificationMethod: null,
        error: 'Computed hash does not match remote hash'
      });
      vi.restoreAllMocks();
    });
  });
});
