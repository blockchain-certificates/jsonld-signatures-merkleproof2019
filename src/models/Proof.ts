interface PathDefinition {
  left?: string;
  right?: string;
}

export interface JSONLDProof {
  type: string;
  created: string;
  proofValue: string;
  proofPurpose: string;
  verificationMethod: string;
}

export interface DecodedProof {
  anchors: string[];
  merkleRoot: string;
  targetHash: string;
  path: PathDefinition[];
}
