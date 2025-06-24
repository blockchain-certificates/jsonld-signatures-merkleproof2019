import {describe, expect, it} from 'vitest';
import { SupportedChains } from '@blockcerts/explorer-lookup'
import didDocument from '../fixtures/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import { publicKeyUInt8ArrayFromJwk } from '../../src/utils/keyUtils';
import {computeBitcoinAddressFromPublicKey, computeEthereumAddressFromPublicKey} from '../../src/utils/issuingAddress';

describe('issuingAddress util test suite', function () {
  const publicKey = didDocument.verificationMethod[0].publicKeyJwk;
  const publicKeyUint8 = publicKeyUInt8ArrayFromJwk(publicKey);

  it('should compute a bitcoin address from a public key', function () {
    const btcAddress = computeBitcoinAddressFromPublicKey(publicKeyUint8, { code: SupportedChains.Testnet } as any);
    expect(btcAddress).toBe('mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am');
  });

  it('should compute an ethereum address from a public key', function () {
    const ethAddress = computeEthereumAddressFromPublicKey(publicKeyUint8, { code: SupportedChains.Ethmain } as any);
    expect(ethAddress).toBe('0x40cf9b7db6fcc742ad0a76b8588c7f8de2b54a60');
  });
});
