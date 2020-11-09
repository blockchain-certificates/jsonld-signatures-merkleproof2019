interface PathDefinition {
  left?: string;
  right?: string;
}

export default interface Proof {
  anchors: string[];
  merkleRoot: string;
  targetHash: string;
  path: PathDefinition[];
}
