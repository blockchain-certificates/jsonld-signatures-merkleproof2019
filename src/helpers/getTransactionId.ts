import Proof from '../models/Proof';

export default function getTransactionId (proof: Proof = null): string {
  if (!proof) {
    throw new Error('Proof is not set');
  }
  const { anchors } = proof;
  const anchor = anchors[0];

  if (typeof anchor === 'string') {
    const dataArray = anchor.split(':');
    return dataArray.pop();
  }

  throw new Error('Could not retrieve transaction id as was provided an unexpected format');
}
