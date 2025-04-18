import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { IDidDocumentPublicKey } from '@decentralized-identity/did-common-typescript';
import didDocument from '../fixtures/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import { BLOCKCHAINS } from '@blockcerts/explorer-lookup';
import { deriveIssuingAddressFromPublicKey } from '../../src/inspectors';

describe('deriveIssuingAddressFromPublicKey test suite', function () {
  let publicKey: IDidDocumentPublicKey;

  beforeEach(function () {
    publicKey = Object.assign({}, didDocument.verificationMethod[0]);
  });

  afterEach(function () {
    publicKey = null;
  });

  describe('given the argument chain was Bitcoin', function () {
    it('should return the address of Bitcoin Mainnet', async function () {
      const address = await deriveIssuingAddressFromPublicKey(publicKey, BLOCKCHAINS.bitcoin);
      expect(address).toBe('127ZSsk5cWiubyDBkocJdW9dFYLN5N1jHF');
    });
  });

  describe('given the argument chain was Mocknet', function () {
    it('should return the address of Bitcoin Mocknet', async function () {
      const address = await deriveIssuingAddressFromPublicKey(publicKey, BLOCKCHAINS.mocknet);
      expect(address).toBe('127ZSsk5cWiubyDBkocJdW9dFYLN5N1jHF');
    });
  });

  describe('given the argument chain was Testnet', function () {
    it('should return the address of Bitcoin Testnet', async function () {
      const address = await deriveIssuingAddressFromPublicKey(publicKey, BLOCKCHAINS.testnet);
      expect(address).toBe('mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am');
    });
  });

  describe('given the argument chain was Ethmain', function () {
    it('should return the address of Ethereum', async function () {
      const address = await deriveIssuingAddressFromPublicKey(publicKey, BLOCKCHAINS.ethmain);
      expect(address).toBe('0x40cf9b7db6fcc742ad0a76b8588c7f8de2b54a60');
    });
  });

  describe('given the argument chain was Ethropst', function () {
    it('should return the address of Ethereum', async function () {
      const address = await deriveIssuingAddressFromPublicKey(publicKey, BLOCKCHAINS.ethropst);
      expect(address).toBe('0x40cf9b7db6fcc742ad0a76b8588c7f8de2b54a60');
    });
  });

  describe('given the argument chain was Ethrinkeby', function () {
    it('should return the address of Ethereum', async function () {
      const address = await deriveIssuingAddressFromPublicKey(publicKey, BLOCKCHAINS.ethrinkeby);
      expect(address).toBe('0x40cf9b7db6fcc742ad0a76b8588c7f8de2b54a60');
    });
  });

  describe('given the argument chain was Ethgoerli', function () {
    it('should return the address of Ethereum', async function () {
      const address = await deriveIssuingAddressFromPublicKey(publicKey, BLOCKCHAINS.ethgoerli);
      expect(address).toBe('0x40cf9b7db6fcc742ad0a76b8588c7f8de2b54a60');
    });
  });

  describe('given the argument chain was Ethsepolia', function () {
    it('should return the address of Ethereum', async function () {
      const address = await deriveIssuingAddressFromPublicKey(publicKey, BLOCKCHAINS.ethsepolia);
      expect(address).toBe('0x40cf9b7db6fcc742ad0a76b8588c7f8de2b54a60');
    });
  });

  describe('given the argument chain was Regtest (Unsupported)', function () {
    it('should throw', async function () {
      await expect(async () => {
        await deriveIssuingAddressFromPublicKey(publicKey, BLOCKCHAINS.regtest);
      }).rejects.toThrow('Issuer identity mismatch - Unsupported blockchain for DID verification');
    });
  });

  describe('given the key format was Multikey', function () {
    it('should return the address of Bitcoin Mainnet', async function () {
      const publicKey = {
        publicKeyMultibase: 'zQ3shw8MAkueKou9VhRyX1v2hDQ2WENWVQNkg6ifhn8DG1gQW'
      };

      const address = await deriveIssuingAddressFromPublicKey(publicKey, BLOCKCHAINS.bitcoin);
      expect(address).toBe('1862cjGVHodmYyvfumSgrgfnWcpCMHK9sq');
    });

    it('should return the address of Bitcoin Testnet', async function () {
      const publicKey = {
        publicKeyMultibase: 'zQ3shvX9Dd7cAG7ZcJN4d9DksshpVYSGpqEyrLjopoGpk97CR'
      };

      const address = await deriveIssuingAddressFromPublicKey(publicKey, BLOCKCHAINS.testnet);
      expect(address).toBe('mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am');
    });

    it('should return the address of Ethereum', async function () {
      const publicKey = {
        publicKeyMultibase: 'zQ3shvX9Dd7cAG7ZcJN4d9DksshpVYSGpqEyrLjopoGpk97CR'
      };

      const address = await deriveIssuingAddressFromPublicKey(publicKey, BLOCKCHAINS.ethmain);
      expect(address).toBe('0x40cf9b7db6fcc742ad0a76b8588c7f8de2b54a60');
    });
  });
});
