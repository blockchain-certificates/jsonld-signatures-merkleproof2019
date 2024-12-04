import VerifierError from '../models/VerifierError';
import getText from '../helpers/getText';
import type { VCProof } from '../models/Proof';

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

function assertProofDomain ({ expectedDomain, proof }): void {
  if (!expectedDomain.includes(proof.domain)) {
    throw new VerifierError('assertProofValidity',
      getText('errors', 'assertProofValidityDomainVerifier')
        // eslint-disable-next-line no-template-curly-in-string
        .replace('${expectedDomain}', expectedDomain)
        // eslint-disable-next-line no-template-curly-in-string
        .replace('${proof.domain}', proof.domain)
    );
  }
}

interface AssertProofValidityAPI {
  expectedProofPurpose: string;
  expectedDomain: string[];
  proof: VCProof;
  issuer: any;
}

export default function assertProofValidity ({
  expectedProofPurpose,
  expectedDomain,
  proof,
  issuer
}: AssertProofValidityAPI): boolean {
  if (proof.proofPurpose) {
    assertProofPurposeValidity({ expectedProofPurpose, proof, issuer });
  }

  if (proof.domain) {
    assertProofDomain({ expectedDomain, proof });
  }

  return true;
}
