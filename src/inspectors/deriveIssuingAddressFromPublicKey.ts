import type { IDidDocumentPublicKey } from '@decentralized-identity/did-common-typescript';
import { publicKeyUInt8ArrayFromJwk, publicKeyUInt8ArrayFromMultibase } from '../utils/keyUtils';
import { computeBitcoinAddressFromPublicKey, computeEthereumAddressFromPublicKey } from '../utils/issuingAddress';
import getText from '../helpers/getText';
import VerifierError from '../models/VerifierError';
import { SupportedChains } from '@blockcerts/explorer-lookup';
import type { IBlockchainObject } from '@blockcerts/explorer-lookup';
import type { ISecp256k1PublicKeyJwk } from '../utils/keyUtils';

export default async function deriveIssuingAddressFromPublicKey (verificationMethodPublicKey: IDidDocumentPublicKey, chain: IBlockchainObject): Promise<string> {
  let publicKey;
  if ('publicKeyJwk' in verificationMethodPublicKey) {
    publicKey = publicKeyUInt8ArrayFromJwk(verificationMethodPublicKey.publicKeyJwk as ISecp256k1PublicKeyJwk);
  } else if ('publicKeyMultibase' in verificationMethodPublicKey) {
    publicKey = await publicKeyUInt8ArrayFromMultibase(verificationMethodPublicKey);
  }

  const baseError = getText('errors', 'identityErrorBaseMessage');
  let address: string = '';
  switch (chain.code) {
    case SupportedChains.Bitcoin:
    case SupportedChains.Mocknet:
    case SupportedChains.Testnet:
      address = computeBitcoinAddressFromPublicKey(publicKey, chain);
      break;

    case SupportedChains.Ethmain:
    case SupportedChains.Ethropst:
    case SupportedChains.Ethrinkeby:
    case SupportedChains.Ethgoerli:
    case SupportedChains.Ethsepolia:
      address = computeEthereumAddressFromPublicKey(publicKey, chain);
      break;

    default:
      throw new VerifierError('deriveIssuingAddressFromPublicKey', `${baseError} - ${getText('errors', 'deriveIssuingAddressFromPublicKey')}`);
  }
  return address;
}
