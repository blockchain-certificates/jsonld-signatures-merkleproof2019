import getText from '../helpers/getText.js';
import VerifierError from '../models/VerifierError.js';

export default function compareIssuingAddress (issuingAddress: string, derivedIssuingAddress: string): void {
  const baseError = getText('errors', 'identityErrorBaseMessage');
  if (issuingAddress.toLowerCase() !== derivedIssuingAddress.toLowerCase()) {
    throw new VerifierError('compareIssuingAddress', `${baseError} - ${getText('errors', 'compareIssuingAddress')}`);
  }
}
