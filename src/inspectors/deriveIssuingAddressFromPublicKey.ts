import type { IDidDocumentPublicKey } from '@decentralized-identity/did-common-typescript';
import { publicKeyUInt8ArrayFromJwk } from '../utils/keyUtils';
import { computeBitcoinAddressFromPublicKey, computeEthereumAddressFromPublicKey } from '../utils/issuingAddress';
import getText from '../helpers/getText';
import VerifierError from '../models/VerifierError';
import { SupportedChains } from '../constants/blockchains';
import type { IBlockchainObject } from '../constants/blockchains';
import type { ISecp256k1PublicKeyJwk } from '../utils/keyUtils';

export default function deriveIssuingAddressFromPublicKey (verificationMethodPublicKey: IDidDocumentPublicKey, chain: IBlockchainObject): string {
  const publicKey = publicKeyUInt8ArrayFromJwk(verificationMethodPublicKey.publicKeyJwk as ISecp256k1PublicKeyJwk);
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
