import { Buffer as BufferPolyfill } from 'buffer';
// @ts-expect-error not a TS package
import * as multikey from '@digitalbazaar/ecdsa-multikey';

const buffer = typeof Buffer === 'undefined' ? BufferPolyfill : Buffer;

/** Secp256k1 Public Key  */
export interface ISecp256k1PublicKeyJwk {
  /** key type */
  kty: string;

  /** curve */
  crv: string;

  /** public point */
  x: string;

  /** public point */
  y: string;

  /** key id */
  kid: string;
}

/** convert jwk to hex encoded public key */
export const publicKeyHexFromJwk = (jwk: ISecp256k1PublicKeyJwk): string => {
  jwk = {
    ...jwk,
    crv: 'K-256'
  }
  const compressed = multikey.toPublicKeyBytes({jwk});
  return buffer.from(compressed).toString('hex');
};

/** convert jwk to binary encoded public key */
export const publicKeyUInt8ArrayFromJwk = (jwk: ISecp256k1PublicKeyJwk): Buffer => {
  const publicKeyHex: string = publicKeyHexFromJwk(jwk);
  let asBuffer = buffer.from(publicKeyHex, 'hex');
  let padding = 32 - asBuffer.length;
  while (padding > 0) {
    asBuffer = buffer.concat([buffer.from('00', 'hex'), asBuffer]);
    padding--;
  }
  return asBuffer;
};

export const publicKeyUInt8ArrayFromMultibase = async ({ publicKeyMultibase }): Promise<Buffer> => {
  const pubKeyJwk: ISecp256k1PublicKeyJwk = await multikey.toJwk({ keyPair: { publicKeyMultibase } });
  return publicKeyUInt8ArrayFromJwk(pubKeyJwk);
};
