import VerifierError from '../models/VerifierError.js';
import getText from '../helpers/getText.js';

export default function ensureMerkleRootEqual (merkleRoot: string, remoteHash: string): boolean {
  if (merkleRoot !== remoteHash) {
    throw new VerifierError(
      'checkMerkleRoot',
      getText('errors', 'ensureMerkleRootEqual')
    );
  }

  return true;
}
