import keyto from '@trust/keyto';
import base64url from 'base64url';
import crypto from 'crypto';
import bs58 from 'bs58';
import secp256k1 from 'secp256k1';
import { Buffer as BufferPolyfill } from 'buffer';
import canonicalize from 'canonicalize';
// @ts-expect-error not a TS package
import * as multikey from '@digitalbazaar/ecdsa-multikey';

const buffer = typeof Buffer === 'undefined' ? BufferPolyfill : Buffer;

const compressedHexEncodedPublicKeyLength = 66;

/** Secp256k1 Private Key  */
export interface ISecp256k1PrivateKeyJwk {
  /** key type */
  kty: string;

  /** curve */
  crv: string;

  /** private point */
  d: string;

  /** public point */
  x: string;

  /** public point */
  y: string;

  /** key id */
  kid: string;
}

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

/**
 * Example
 * ```js
 * {
 *  kty: 'EC',
 *  crv: 'secp256k1',
 *  d: 'rhYFsBPF9q3-uZThy7B3c4LDF_8wnozFUAEm5LLC4Zw',
 *  x: 'dWCvM4fTdeM0KmloF57zxtBPXTOythHPMm1HCLrdd3A',
 *  y: '36uMVGM7hnw-N6GnjFcihWE3SkrhMLzzLCdPMXPEXlA',
 *  kid: 'JUvpllMEYUZ2joO59UNui_XYDqxVqiFLLAJ8klWuPBw'
 * }
 * ```
 * See [rfc7638](https://tools.ietf.org/html/rfc7638) for more details on Jwk.
 */
export const getKid = (
  jwk: ISecp256k1PrivateKeyJwk | ISecp256k1PublicKeyJwk
): string => {
  const copy = { ...jwk } as any;
  delete copy.d;
  delete copy.kid;
  delete copy.alg;
  const digest = crypto
    .createHash('sha256')
    .update(canonicalize(copy))
    .digest();

  return base64url.encode(buffer.from(digest));
};

/** convert compressed hex encoded private key to jwk */
export const privateKeyJwkFromPrivateKeyHex = (privateKeyHex: string): ISecp256k1PrivateKeyJwk => {
  const jwk: ISecp256k1PrivateKeyJwk = {
    ...keyto.from(privateKeyHex, 'blk').toJwk('private'),
    crv: 'secp256k1'
  };
  const kid: string = getKid(jwk);
  return {
    ...jwk,
    kid
  };
};

/** convert compressed hex encoded public key to jwk */
export const publicKeyJwkFromPublicKeyHex = (publicKeyHex: string): ISecp256k1PublicKeyJwk => {
  let key: string = publicKeyHex;
  if (publicKeyHex.length === compressedHexEncodedPublicKeyLength) {
    const keyBin = secp256k1.publicKeyConvert(
      buffer.from(publicKeyHex, 'hex'),
      false
    );
    key = buffer.from(keyBin).toString('hex');
  }
  const jwk: ISecp256k1PublicKeyJwk = {
    ...keyto.from(key, 'blk').toJwk('public'),
    crv: 'secp256k1'
  };
  const kid: string = getKid(jwk);

  return {
    ...jwk,
    kid
  };
};

/** convert pem encoded private key to jwk */
export const privateKeyJwkFromPrivateKeyPem = (privateKeyPem: string): ISecp256k1PrivateKeyJwk => {
  const jwk: ISecp256k1PrivateKeyJwk = {
    ...keyto.from(privateKeyPem, 'pem').toJwk('private'),
    crv: 'secp256k1'
  };
  // console.log(jwk);
  const kid: string = getKid(jwk);

  return {
    ...jwk,
    kid
  };
};

/** convert pem encoded public key to jwk */
export const publicKeyJwkFromPublicKeyPem = (publicKeyPem: string): ISecp256k1PublicKeyJwk => {
  const jwk: ISecp256k1PublicKeyJwk = {
    ...keyto.from(publicKeyPem, 'pem').toJwk('public'),
    crv: 'secp256k1'
  };
  const kid = getKid(jwk);

  return {
    ...jwk,
    kid
  };
};

/** convert jwk to hex encoded private key */
export const privateKeyHexFromJwk = (jwk: ISecp256k1PrivateKeyJwk): string =>
  keyto
    .from(
      {
        ...jwk,
        crv: 'K-256'
      },
      'jwk'
    )
    .toString('blk', 'private');

/** convert jwk to hex encoded public key */
export const publicKeyHexFromJwk = (jwk: ISecp256k1PublicKeyJwk): string => {
  const uncompressedPublicKey: string = keyto
    .from(
      {
        ...jwk,
        crv: 'K-256'
      },
      'jwk'
    )
    .toString('blk', 'public');

  const compressed: string = secp256k1.publicKeyConvert(
    buffer.from(uncompressedPublicKey, 'hex'),
    true
  );
  return buffer.from(compressed).toString('hex');
};

/** convert jwk to binary encoded private key */
export const privateKeyUInt8ArrayFromJwk = (jwk: ISecp256k1PrivateKeyJwk): Buffer => {
  const privateKeyHex: string = privateKeyHexFromJwk(jwk);
  let asBuffer = buffer.from(privateKeyHex, 'hex');
  let padding = 32 - asBuffer.length;
  while (padding > 0) {
    asBuffer = buffer.concat([buffer.from('00', 'hex'), asBuffer]);
    padding--;
  }
  return asBuffer;
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

export const publicKeyUInt8ArrayFromMultibase = async (publicKeyMultibase): Promise<Buffer> => {
  const pubKeyJwk: ISecp256k1PublicKeyJwk = await multikey.toJwk({ keyPair: publicKeyMultibase });
  return publicKeyUInt8ArrayFromJwk(pubKeyJwk);
};

/** convert publicKeyHex to base58 */
export const publicKeyBase58FromPublicKeyHex = (publicKeyHex: string): string => {
  return bs58.encode(buffer.from(publicKeyHex, 'hex'));
};

/** convert publicKeyHex to base58 */
export const privateKeyBase58FromPrivateKeyHex = (privateKeyHex: string): string => {
  return bs58.encode(buffer.from(privateKeyHex, 'hex'));
};

export const privateKeyUInt8ArrayFromPrivateKeyBase58 = (
  privateKeyBase58: string
): Buffer => {
  return bs58.decode(privateKeyBase58);
};

export const publicKeyUInt8ArrayFromPublicKeyBase58 = (
  publicKeyBase58: string
): Buffer => {
  return bs58.decode(publicKeyBase58);
};

export const publicKeyHexFromPrivateKeyHex = (privateKeyHex: string): string => {
  const publicKey = secp256k1.publicKeyCreate(
    new Uint8Array(buffer.from(privateKeyHex, 'hex'))
  );
  return buffer.from(publicKey).toString('hex');
};

export const publicKeyJwkFromPublicKeyBase58 = (publicKeybase58: string): ISecp256k1PublicKeyJwk => {
  const decodedPublicKeyAsHex: string = bs58.decode(publicKeybase58).toString('hex');
  return publicKeyJwkFromPublicKeyHex(decodedPublicKeyAsHex);
};

export const privateKeyJwkFromPrivateKeyBase58 = (privateKeyBase58: string): ISecp256k1PrivateKeyJwk => {
  const decodedPrivateKeyAsHex: string = bs58.decode(privateKeyBase58).toString('hex');
  return privateKeyJwkFromPrivateKeyHex(decodedPrivateKeyAsHex);
};
