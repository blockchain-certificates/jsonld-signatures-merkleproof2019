export default function ensureMerkleRootEqual (merkleRoot: string, remoteHash: string): boolean {
  if (merkleRoot !== remoteHash) {
    throw new Error('Merkle root does not match remote hash.');
  }

  return true;
}
