import VerifierError from '../models/VerifierError.js';
import getText from '../helpers/getText.js';

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
