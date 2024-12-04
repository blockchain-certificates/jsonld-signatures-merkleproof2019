import VerifierError from '../models/VerifierError';
import getText from '../helpers/getText';

function assertProofPurposeValidity ({ expectedProofPurpose, proof, issuer }): void {
  if (proof.proofPurpose !== expectedProofPurpose) {
    throw new VerifierError('assertProofValidity',
      getText('errors', 'assertProofValidityPurposeVerifier')
        // eslint-disable-next-line no-template-curly-in-string
        .replace('${expectedProofPurpose}', expectedProofPurpose)
        // eslint-disable-next-line no-template-curly-in-string
        .replace('${proof.proofPurpose}', proof.proofPurpose)
    );
  }

  if (issuer && !issuer[expectedProofPurpose]?.includes(proof.verificationMethod)) {
    throw new VerifierError('assertProofValidity',
      getText('errors', 'assertProofValidityPurposeIssuerKey')
        // eslint-disable-next-line no-template-curly-in-string
        .replace('${proof.verificationMethod}', proof.verificationMethod)
        // eslint-disable-next-line no-template-curly-in-string
        .replace('${expectedProofPurpose}', expectedProofPurpose)
    );
  }
}

export default function assertProofValidity ({
  expectedProofPurpose,
  proof,
  issuer
}): boolean {
  if (proof.proofPurpose) {
    assertProofPurposeValidity({ expectedProofPurpose, proof, issuer });
  }

  return true;
}
