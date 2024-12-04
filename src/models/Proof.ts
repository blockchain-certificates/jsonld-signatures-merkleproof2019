export interface PathDefinition {
  left?: string;
  right?: string;
}

export interface VCProof {
  type: string;
  created: string;
  proofValue?: string;
  jws?: string;
  proofPurpose: string;
  verificationMethod: string;
  chainedProofType?: string;
  previousProof?: VCProof;
  domain?: string;
}

export interface DecodedProof {
  anchors: string[];
  merkleRoot: string;
  targetHash: string;
  path: PathDefinition[];
}
