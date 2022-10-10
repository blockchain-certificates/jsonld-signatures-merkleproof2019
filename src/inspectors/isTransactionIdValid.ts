import VerifierError from '../models/VerifierError';
import getText from '../helpers/getText';

export default function isTransactionIdValid (transactionId: string): string {
  if (typeof transactionId === 'string' && transactionId.length > 0) {
    return transactionId;
  } else {
    throw new VerifierError(
      'getTransactionId',
      getText('errors', 'isTransactionIdValid')
    );
  }
}
