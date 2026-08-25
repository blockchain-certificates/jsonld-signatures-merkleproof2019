import VerifierError from '../models/VerifierError.js';
import { ProblemDetailsType } from '../models/ProblemDetails.js';
import getText from '../helpers/getText.js';

export default function ensureHashesEqual (actual: string, expected: string): boolean {
  if (actual !== expected) {
    throw new VerifierError(
      'compareHashes',
      getText('errors', 'ensureHashesEqual'),
      ProblemDetailsType.CRYPTOGRAPHIC_SECURITY_ERROR
    );
  }

  return true;
}
