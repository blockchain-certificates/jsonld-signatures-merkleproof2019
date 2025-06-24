import * as bitcoin from 'bitcoinjs-lib';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { keccak256 } from 'js-sha3';
import { Buffer as BufferPolyfill } from 'buffer';
import type { IBlockchainObject } from '@blockcerts/explorer-lookup';

export function computeBitcoinAddressFromPublicKey (publicKey: Buffer, chain: IBlockchainObject): string {
  return bitcoin.payments.p2pkh({ pubkey: publicKey, network: bitcoin.networks[chain.code] }).address;
}

export function computeEthereumAddressFromPublicKey (publicKey: Buffer, chain: IBlockchainObject): string {
  const buffer = typeof Buffer === 'undefined' ? BufferPolyfill : Buffer;
  const publicKeyString = publicKey.toString('hex');

  // Convert to uncompressed format
  const publicKeyUncompressed = buffer.from(
    secp256k1.Point.fromHex(publicKeyString).toRawBytes(false)
  ).toString('hex').slice(2);

  // Now apply keccak
  const address: string = keccak256(buffer.from(publicKeyUncompressed, 'hex')).slice(64 - 40);
  return `0x${address.toString()}`;
}
