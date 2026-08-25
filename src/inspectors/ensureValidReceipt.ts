import { sha256 } from '@noble/hashes/sha2.js';
import { Buffer } from 'buffer';
import VerifierError from '../models/VerifierError.js';
import { ProblemDetailsType } from '../models/ProblemDetails.js';
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
          proofHash = Buffer.from(sha256(Uint8Array.from(appendedBuffer))).toString('hex');
        } else if (typeof node.right !== 'undefined') {
          appendedBuffer = toByteArray(`${proofHash}${node.right}`);
          proofHash = Buffer.from(sha256(Uint8Array.from(appendedBuffer))).toString('hex');
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
      getText('errors', 'ensureValidReceipt'),
      ProblemDetailsType.CRYPTOGRAPHIC_SECURITY_ERROR
    );
  }

  if (proofHash !== merkleRoot) {
    throw new VerifierError(
      'checkReceipt',
      getText('errors', 'invalidMerkleReceipt'),
      ProblemDetailsType.CRYPTOGRAPHIC_SECURITY_ERROR
    );
  }
}
