interface PathDefinition {
  left?: string;
  right?: string;
}

export interface JSONLDProof {
  type: string;
  created: string;
  proofValue?: string;
  jws?: string;
  proofPurpose: string;
  verificationMethod: string;
  chainedProofType?: string;
  previousProof?: JSONLDProof;
}

export interface DecodedProof {
  anchors: string[];
  merkleRoot: string;
  targetHash: string;
  path: PathDefinition[];
}
