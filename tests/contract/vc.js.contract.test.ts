import { describe, it, expect } from 'vitest';
import { preloadedContexts } from '@blockcerts/schemas';
import jsonld from 'jsonld';
import { LDMerkleProof2019 } from '../../src';
import blockcertsDocument from '../fixtures/testnet-v3-did';
import * as vcjs from '@digitalbazaar/vc';
// import { vaultiePresentation } from '../fixtures/vaultie-authenticity-report';
import didDocument from '../fixtures/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';

function generateDocumentLoader (): any {
  preloadedContexts[blockcertsDocument.issuer.id] = didDocument;
  const customLoader = function (url): any {
    if (url in preloadedContexts) {
      return {
        contextUrl: null,
        document: preloadedContexts[url],
        documentUrl: url
      };
    }
    return (jsonld as any).documentLoader(url);
  };
  return customLoader;
}

describe('Contract test suite', function () {
  describe('vc.js compatibility', function () {
    it('should issue a MerkleProof2019 signed document', async function () {
      const candidateDocument = {
        ...blockcertsDocument
      }
      delete candidateDocument.proof;
      const suite = new LDMerkleProof2019({
        document: blockcertsDocument,
        verificationMethod: didDocument.verificationMethod[0]
      });

      const document = await vcjs.issue({
        credential: candidateDocument,
        suite
      });

      expect(document.proof).toBeDefined();
      expect(document.proof.type).toBe('DataIntegrityProof');
      expect(document.proof.cryptosuite).toBe('merkle-proof-2019');
    });

    it('should verify a MerkleProof2019 signed document', async function () {
      const suite = [new LDMerkleProof2019({
        document: blockcertsDocument,
        verificationMethod: didDocument.verificationMethod[0]
      })];

      const verificationStatus = await vcjs.verifyCredential({
        credential: blockcertsDocument,
        suite,
        documentLoader: generateDocumentLoader()
      });

      if (verificationStatus.verified === false) {
        console.log(JSON.stringify(verificationStatus, null, 2));
      }

      expect(verificationStatus.verified).toBe(true);
    });

    // TODO: Access to DID document needed for verification
    //
    // it('should verify a non Blockcerts document', async function () {
    //   const credential = vaultiePresentation.verifiableCredential[0];
    //   const suite = [new LDMerkleProof2019({
    //     document: credential,
    //     verificationMethod
    //   })];
    //
    //   const verificationStatus = await vcjs.verifyCredential({
    //     credential,
    //     suite,
    //     documentLoader: generateDocumentLoader()
    //   });
    //
    //   if (verificationStatus.verified === false) {
    //     console.log(JSON.stringify(verificationStatus, null, 2));
    //   }
    //
    //   expect(verificationStatus.verified).toBe(true);
    // });
  });
});
