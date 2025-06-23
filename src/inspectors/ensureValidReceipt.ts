import sha256 from 'sha256';
import VerifierError from '../models/VerifierError.js';
import { toByteArray } from '../utils/data.js';
import getText from '../helpers/getText.js';
import type { DecodedProof, PathDefinition } from '../models/Proof';

export default function ensureValidReceipt (receipt: DecodedProof): void {
  let proofHash: string = receipt.targetHash;
  const merkleRoot = receipt.merkleRoot;

  try {
    const proof = receipt.path;
    if (proof && proofHash) {
      for (const index in proof) {
        const node: PathDefinition = proof[index];
        let appendedBuffer;
        if (typeof node.left !== 'undefined') {
          appendedBuffer = toByteArray(`${node.left}${proofHash}`);
          proofHash = sha256(appendedBuffer) as any;
        } else if (typeof node.right !== 'undefined') {
          appendedBuffer = toByteArray(`${proofHash}${node.right}`);
          proofHash = sha256(appendedBuffer) as any;
        } else {
          throw new VerifierError(
            'checkReceipt',
            'Trigger catch error.'
          );
        }
      }
    }
  } catch (e) {
    throw new VerifierError(
      'checkReceipt',
      getText('errors', 'ensureValidReceipt')
    );
  }

  if (proofHash !== merkleRoot) {
    throw new VerifierError(
      'checkReceipt',
      getText('errors', 'invalidMerkleReceipt')
    );
  }
}
