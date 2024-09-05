import getText from '../helpers/getText';
import VerifierError from '../models/VerifierError';

export default function compareIssuingAddress (issuingAddress: string, derivedIssuingAddress: string): void {
  const baseError = getText('errors', 'identityErrorBaseMessage');
  if (issuingAddress.toLowerCase() !== derivedIssuingAddress.toLowerCase()) {
    throw new VerifierError('compareIssuingAddress', `${baseError} - ${getText('errors', 'compareIssuingAddress')}`);
  }
}
