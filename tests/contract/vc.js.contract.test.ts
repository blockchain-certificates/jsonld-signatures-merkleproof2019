import vcjs from '@digitalbazaar/vc';
import { preloadedContexts } from '@blockcerts/schemas';
import jsonld from 'jsonld';
import { MerkleProof2019 } from '../../src/MerkleProof2019';
import blockcertsDocument from '../fixtures/testnet-v3-did.json';

function generateDocumentLoader (): any {
  const customLoader = function (url): any {
    if (url in preloadedContexts) {
      return {
        contextUrl: null,
        document: preloadedContexts[url],
        documentUrl: url
      };
    }
    return jsonld.documentLoader(url);
  };
  return customLoader;
}

describe('Contract test suite', function () {
  describe('vc.js compatibility', function () {
    it('should verify a MerkleProof2019 signed document', async function () {
      const suite = [new MerkleProof2019({ document: blockcertsDocument })];
      const verificationStatus = await vcjs.verify({
        presentation: blockcertsDocument,
        suite,
        documentLoader: generateDocumentLoader()
      });
      console.log(verificationStatus);
      expect(verificationStatus.verified).toBe(true);
    });
  });
});
