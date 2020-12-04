import { ExplorerAPI } from './models/Explorers';
import { DecodedProof, JSONLDProof } from './models/Proof';
import { TransactionData } from './models/TransactionData';
import { IParsingFunctionAPI } from './explorers/explorer';
import { IBlockchainObject } from './constants/blockchains';

export interface MerkleProof2019Options {
  explorerAPIs?: ExplorerAPI[];
}

export interface VCDocument {
  proof: JSONLDProof;
}

export interface MerkleProof2019API {
  options?: MerkleProof2019Options;
  type?: 'MerkleProof2019';
  issuer?: any; // TODO: define issuer type
  verificationMethod?: string;
  document: VCDocument;
}

export interface MerkleProof2019VerificationResult {
  verified: boolean;
  error?: string;
}

declare class MerkleProof2019 {
  /* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-useless-constructor */
  public type: string;
  public issuer: any; // TODO: define issuer type
  public verificationMethod: string;
  public proof: DecodedProof;
  public document: VCDocument;
  public explorerAPIs: ExplorerAPI[];
  public chain: IBlockchainObject;
  public txData: TransactionData;
  public localDocumentHash: string;

  constructor ({
    type = 'MerkleProof2019',
    issuer = null,
    verificationMethod = '',
    document = null,
    options = {}
  }: MerkleProof2019API) {}

  async verifyProof (): Promise<MerkleProof2019VerificationResult> {}
  /* eslint-enable @typescript-eslint/no-empty-function, @typescript-eslint/no-useless-constructor */
}

export {
  ExplorerAPI,
  TransactionData,
  IParsingFunctionAPI,
  MerkleProof2019
};
