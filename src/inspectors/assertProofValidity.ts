import VerifierError from '../models/VerifierError';
import getText from '../helpers/getText';
import type { VCProof } from '../models/Proof';

interface AssertProofPurposeValidityAPI {
  expectedProofPurpose: string;
  proof: VCProof;
  issuer: any; // TODO: use better defined, from CVJS potentially (split to avoid circular dependency)
}

function assertProofPurposeValidity ({ expectedProofPurpose, proof, issuer }: AssertProofPurposeValidityAPI): void {
  if (proof.proofPurpose !== expectedProofPurpose) {
    throw new VerifierError('assertProofValidity',
      getText('errors', 'assertProofValidityPurposeVerifier')
        .replace('${expectedProofPurpose}', expectedProofPurpose)
        .replace('${proof.proofPurpose}', proof.proofPurpose)
    );
  }

  if (issuer && !issuer[expectedProofPurpose]?.includes(proof.verificationMethod)) {
    throw new VerifierError('assertProofValidity',
      getText('errors', 'assertProofValidityPurposeIssuerKey')
        .replace('${proof.verificationMethod}', proof.verificationMethod)
        .replace('${expectedProofPurpose}', expectedProofPurpose)
    );
  }

  if (expectedProofPurpose === 'authentication' && !proof.domain) {
    // TODO: return actual warning
    console.warn('No domain found in proof, but it is recommended for authentication purposes');
  }
}

interface AssertProofDomainAPI {
  expectedDomain: string[];
  proof: VCProof;
  expectedChallenge: string;
}

function assertProofDomain ({ expectedDomain, proof, expectedChallenge }: AssertProofDomainAPI): void {
  if (!expectedDomain.includes(proof.domain)) {
    throw new VerifierError('assertProofValidity',
      getText('errors', 'assertProofValidityDomainVerifier')
        .replace('${expectedDomain}', expectedDomain.join(', '))
        .replace('${proof.domain}', proof.domain)
    );
  }

  if (proof.domain && !proof.challenge) {
    // TODO: return actual warning
    console.warn('No challenge found in proof, but it is recommended for domain verification');
  }

  if (proof.challenge && proof.challenge !== expectedChallenge) {
    throw new VerifierError('assertProofValidity',
      getText('errors', 'assertProofValidityInvalidChallenge'));
  }
}

interface AssertProofValidityAPI {
  expectedProofPurpose: string;
  expectedDomain: string[];
  expectedChallenge: string;
  proof: VCProof;
  issuer: any;
}

export default function assertProofValidity ({
  expectedProofPurpose,
  expectedDomain,
  expectedChallenge,
  proof,
  issuer
}: AssertProofValidityAPI): boolean {
  if (!proof.proofPurpose) {
    throw new VerifierError('assertProofValidity', getText('errors', 'assertProofValidityNoProofPurpose'));
  }

  if (!proof.created) {
    throw new VerifierError('assertProofValidity', getText('errors', 'assertProofValidityNoCreated'));
  }

  if (proof.proofPurpose) {
    assertProofPurposeValidity({ expectedProofPurpose, proof, issuer });
  }

  if (proof.domain) {
    assertProofDomain({ expectedDomain, proof, expectedChallenge });
  }

  return true;
}
