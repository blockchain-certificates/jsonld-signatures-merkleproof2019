import { describe, it, expect, vi } from 'vitest';
import fixture from '../fixtures/ethereum-sepolia-v3';
import { LDMerkleProof2019 } from '../../src';

describe('Given the anchoring chain is Ethereum Sepolia', function () {
  describe('when the certificate is valid', function () {
    it('should verify successfully', async function () {
      vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
        const explorerLookup = await importOriginal();
        return {
          ...explorerLookup,
          lookForTx: () => ({
            remoteHash: 'b2c64ed78cccda992431c265a1d0bb657e8cefd14b1ef15ceadcc697c566994f',
            issuingAddress: '0x40cf9b7db6fcc742ad0a76b8588c7f8de2b54a60',
            time: '2022-11-02T02:33:24.000Z',
            revokedAddresses: []
          })
        };
      });
      const instance = new LDMerkleProof2019({ document: fixture });
      const result = await instance.verifyProof();
      expect(result).toEqual({
        verified: true,
        verificationMethod: null,
        error: ''
      });
      vi.restoreAllMocks();
    });
  });
});
