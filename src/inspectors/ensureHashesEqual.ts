import VerifierError from '../models/VerifierError';
import getText from '../helpers/getText';

export default function ensureHashesEqual (actual: string, expected: string): boolean {
  if (actual !== expected) {
    throw new VerifierError(
      'compareHashes',
      getText('errors', 'ensureHashesEqual')
    );
  }

  return true;
}
