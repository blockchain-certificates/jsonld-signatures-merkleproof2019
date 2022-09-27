import getText from './getText';
import { dateToUnixTimestamp } from '../utils/date';
import { Issuer, IssuerPublicKeyList } from '../models/Issuer';
import Key from '../models/Key';
import type { NullableNumber } from '../models/helpers';

function createKeyObject (rawKeyObject, finalPublicKey = null): Key {
  const created: NullableNumber = rawKeyObject.created ? dateToUnixTimestamp(rawKeyObject.created) : null;
  const revoked: NullableNumber = rawKeyObject.revoked ? dateToUnixTimestamp(rawKeyObject.revoked) : null;
  const expires: NullableNumber = rawKeyObject.expires ? dateToUnixTimestamp(rawKeyObject.expires) : null;
  // backcompat for v2 alpha
  let publicKey: string = finalPublicKey;
  if (!finalPublicKey) {
    const publicKeyTemp: string = rawKeyObject.id || rawKeyObject.publicKey;
    publicKey = publicKeyTemp.replace('ecdsa-koblitz-pubkey:', '');
  }
  return new Key(publicKey, created, revoked, expires);
}

export default function parseIssuerKeys (issuerProfileJson: Issuer): IssuerPublicKeyList {
  try {
    const keyMap: IssuerPublicKeyList = {};
    if ('@context' in issuerProfileJson) {
      const responseKeys = issuerProfileJson.publicKey;
      for (let i = 0; i < responseKeys.length; i++) {
        const key = createKeyObject(responseKeys[i]);
        keyMap[key.publicKey] = key;
      }
    }
    return keyMap;
  } catch (e) {
    console.error(e);
    throw new Error(
      `parseIssuerKeys - ${getText('errors', 'parseIssuerKeys')}`
    );
  }
}
