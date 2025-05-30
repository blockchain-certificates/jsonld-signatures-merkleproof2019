import * as bitcoin from 'bitcoinjs-lib';
import { ec } from 'elliptic';
import { keccak256 } from 'js-sha3';
import { Buffer as BufferPolyfill } from 'buffer';
import type { IBlockchainObject } from '@blockcerts/explorer-lookup';

export function computeBitcoinAddressFromPublicKey (publicKey: Buffer, chain: IBlockchainObject): string {
  return bitcoin.payments.p2pkh({ pubkey: publicKey, network: bitcoin.networks[chain.code] }).address;
}

export function computeEthereumAddressFromPublicKey (publicKey: Buffer, chain: IBlockchainObject): string {
  const publicKeyString = publicKey.toString('hex');
  const ellipticCurve = new ec('secp256k1');

  // Decode public key
  const key = ellipticCurve.keyFromPublic(publicKeyString, 'hex');

  // Convert to uncompressed format
  const publicKeyUncompressed: string = key.getPublic().encode('hex').slice(2);

  const buffer = typeof Buffer === 'undefined' ? BufferPolyfill : Buffer;
  // Now apply keccak
  const address: string = keccak256(buffer.from(publicKeyUncompressed, 'hex')).slice(64 - 40);
  return `0x${address.toString()}`;
}
