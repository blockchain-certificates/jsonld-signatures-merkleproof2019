import { buildTransactionServiceUrl } from '../services/transaction-apis';
import { request } from '../services/request';
import { isTestChain, SupportedChains } from '../constants/blockchains';
import { TransactionData } from '../models/TransactionData';
import { ExplorerAPI } from '../models/Explorers';
import { explorerApi as EtherscanApi } from './ethereum/etherscan';
import { explorerApi as BlockCypherETHApi } from './ethereum/blockcypher';
import { explorerApi as BlockExplorerApi } from './bitcoin/blockexplorer';
import { explorerApi as BlockstreamApi } from './bitcoin/blockstream';
import { explorerApi as BlockCypherBTCApi } from './bitcoin/blockcypher';
import { explorerApi as BitPayApi } from './bitcoin/bitpay';

export type TExplorerFunctionsArray = Array<{
  getTxData: (transactionId: string, chain?: SupportedChains) => Promise<TransactionData>;
  priority?: number;
}>;
export interface IParsingFunctionAPI {
  jsonResponse?: any; // the response from the service when called as rest
  chain?: SupportedChains; // TODO: look at how to deprecate this. Only used in etherscan
  key?: string; // identification key to pass to the service -> TODO: can this be merged into the serviceUrl? Only used in etherscan
  keyPropertyName?: string; // the key property to associate with the identification key -> TODO: can this be merged into the serviceUrl? Only used in etherscan
  transactionId?: string; // when using in RPCs we pass the tx id to look up since these functions are responsible for service lookup
  serviceUrl?: string; // the distant service url
}
export type TExplorerParsingFunction = ((data: IParsingFunctionAPI) => TransactionData) |
((data: IParsingFunctionAPI) => Promise<TransactionData>);

export function explorerFactory (TransactionAPIArray: ExplorerAPI[]): TExplorerFunctionsArray {
  return TransactionAPIArray
    .map(explorerAPI => (
      {
        getTxData: async (transactionId, chain) => await getTransactionFromApi(explorerAPI, transactionId, chain),
        priority: explorerAPI.priority
      }
    ));
}

export async function getTransactionFromApi (
  explorerAPI: ExplorerAPI,
  transactionId: string,
  chain: SupportedChains
): Promise<TransactionData> {
  const requestUrl = buildTransactionServiceUrl({
    explorerAPI,
    transactionId,
    isTestApi: isTestChain(chain)
  });

  try {
    const response = await request({ url: requestUrl });
    return await explorerAPI.parsingFunction({
      jsonResponse: JSON.parse(response),
      chain,
      ...explorerAPI
    });
  } catch (err) {
    throw new Error('Unable to get remote hash');
  }
}

const BitcoinTransactionAPIArray = [
  BlockCypherBTCApi,
  BitPayApi,
  BlockExplorerApi,
  BlockstreamApi
];

const EthereumTransactionAPIArray = [
  EtherscanApi,
  BlockCypherETHApi
];

const BlockchainExplorersWithSpentOutputInfo = [
  BlockCypherBTCApi
];

export {
  BitcoinTransactionAPIArray,
  EthereumTransactionAPIArray,
  BlockchainExplorersWithSpentOutputInfo
};
