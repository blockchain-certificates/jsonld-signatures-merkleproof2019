import { DecodedProof } from '../models/Proof';
import { capitalize } from '../utils/string';
import { BLOCKCHAINS, IBlockchainObject } from '../constants/blockchains';

// merkleRoot2019: see https://w3c-dvcg.github.io/lds-merkle-proof-2019/#blockchain-keymap
function getMerkleRoot2019Chain (anchor): IBlockchainObject {
  const dataArray = anchor.split(':');

  let mainChain;
  switch (dataArray[1]) {
    case BLOCKCHAINS.mocknet.blinkCode:
      return getChainObject(BLOCKCHAINS.mocknet.signatureValue);
    case BLOCKCHAINS.bitcoin.blinkCode:
      mainChain = BLOCKCHAINS.bitcoin.name;
      break;
    case BLOCKCHAINS.ethmain.blinkCode:
      mainChain = BLOCKCHAINS.ethmain.name;
      break;
    default:
      throw new Error('Could not retrieve chain.');
  }

  const network = dataArray[2];
  const chainCodeSignatureValue = mainChain.toLowerCase() + capitalize(network);
  return getChainObject(chainCodeSignatureValue);
}

function getChainObject (chainCodeProofValue): IBlockchainObject {
  const chainObject: IBlockchainObject = Object.keys(BLOCKCHAINS)
    .map(key => BLOCKCHAINS[key])
    .find((entry: IBlockchainObject) => entry.signatureValue === chainCodeProofValue);
  return chainObject;
}

export default function getChain (proof: DecodedProof = null): IBlockchainObject {
  if (proof?.anchors) {
    const { anchors } = proof;
    const anchor = anchors[0];
    if (typeof anchor === 'string') {
      return getMerkleRoot2019Chain(anchor);
    }
  }

  return null;
}
