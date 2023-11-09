import type { IDidDocument } from './DidDocument';
import type { IDidDocumentPublicKey } from '@decentralized-identity/did-common-typescript';

export type IssuerPublicKeyList = Record<string, ParsedKeyObjectV2>;

export interface ParsedKeyObjectV2 {
  publicKey: string;
  created: number;
  expires?: number;
  revoked?: number;
}

export interface KeyObjectV2 {
  id: string;
  created: string;
  expires?: string;
  revoked?: string;
}

export interface Issuer {
  '@context'?: string[];
  type?: string;
  id?: string;
  name?: string;
  url?: string;
  image?: string;
  email?: string;
  revocationList?: string;
  publicKey?: string[] | KeyObjectV2[];
  introductionURL?: string;
  introductionAuthenticationMethod?: string;
  introductionSuccessURL?: string;
  introductionErrorURL?: string;
  analyticsURL?: string;
  issuingEstimateAuth?: string;
  issuingEstimateUrl?: string;
  didDocument?: IDidDocument;
  verificationMethod?: IDidDocumentPublicKey[];
}
