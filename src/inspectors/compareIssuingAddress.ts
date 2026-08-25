import getText from '../helpers/getText.js';
import VerifierError from '../models/VerifierError.js';
import { ProblemDetailsType } from '../models/ProblemDetails.js';

export default function compareIssuingAddress (issuingAddress: string, derivedIssuingAddress: string): void {
  const baseError = getText('errors', 'identityErrorBaseMessage');
  if (issuingAddress.toLowerCase() !== derivedIssuingAddress.toLowerCase()) {
    throw new VerifierError('compareIssuingAddress', `${baseError} - ${getText('errors', 'compareIssuingAddress')}`, ProblemDetailsType.CRYPTOGRAPHIC_SECURITY_ERROR);
  }
}
