import { TRANSACTION_APIS } from '../constants/api';
import { TExplorerParsingFunction } from '../explorers/explorer';

export interface ExplorerURLs {
  main: string;
  test: string;
}

export interface ExplorerAPI {
  serviceURL?: string | ExplorerURLs;
  priority?: 0 | 1 | -1; // 0: custom APIs will run before the default APIs, 1: after, -1: reserved to default APIs
  parsingFunction?: TExplorerParsingFunction;
  serviceName?: TRANSACTION_APIS; // in case one would want to overload the default explorers
  key?: string; // the user's own key to the service
  keyPropertyName?: string; // the name of the property
  apiType?: 'rpc' | 'rest'; // whether the parsing function is calling a rpc or rest method. RPC parsing functions are provided for BTC and ETH (EVM) chains
}
