import { preloadedContexts } from '@blockcerts/schemas';
import jsonld from 'jsonld';
import { Headers } from 'node-fetch';
import { LDMerkleProof2019 } from '../../src';
import blockcertsDocument from '../fixtures/testnet-v3-did.json';
import didDocument from '../fixtures/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import precompileEsmModuleToCjs from './helpers/precompileEsmModuleToCjs';

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
    it('should verify a MerkleProof2019 signed document', async function () {
      // jest requirement to prevent ESM issues
      const vcjs = await precompileEsmModuleToCjs('node_modules/@digitalbazaar/vc/lib/index.js', {
        globalThis: {
          Headers
        }
      });

      // actual test suite starts here
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
  });
});
