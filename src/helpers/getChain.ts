import { DecodedProof } from '../models/Proof';
import { capitalize } from '../utils/string';
import { BLOCKCHAINS, IBlockchainObject } from '../constants/blockchains';

// merkleRoot2019: see https://w3c-dvcg.github.io/lds-merkle-proof-2019/#blockchain-keymap
function getMerkleRoot2019Chain (anchor): IBlockchainObject {
  // TODO: refactor - list blink code in BLOCKCHAINS object
  const supportedChainsMap = {
    btc: {
      chainName: BLOCKCHAINS.bitcoin.name
    },
    eth: {
      chainName: BLOCKCHAINS.ethmain.name
    }
  };

  const dataArray = anchor.split(':');

  if (dataArray[1] === BLOCKCHAINS.mocknet.code) {
    return getChainObject(BLOCKCHAINS.mocknet.signatureValue);
  }

  const chainIndex: number = dataArray.findIndex(data => Object.keys(supportedChainsMap).includes(data));
  if (chainIndex > -1) {
    const chainCode = dataArray[chainIndex];
    const network = dataArray[chainIndex + 1];
    const chainCodeProofValue = supportedChainsMap[chainCode].chainName.toLowerCase() + capitalize(network);
    return getChainObject(chainCodeProofValue);
  }
}

function getChainObject (chainCodeProofValue): IBlockchainObject {
  const chainObject: IBlockchainObject = Object.keys(BLOCKCHAINS)
    .map(key => BLOCKCHAINS[key])
    .find((entry: IBlockchainObject) => entry.signatureValue === chainCodeProofValue);
  if (typeof chainObject === 'undefined') {
    throw new Error('Could not retrieve chain.');
  }
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
