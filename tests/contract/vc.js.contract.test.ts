import { preloadedContexts } from '@blockcerts/schemas';
import { rollup } from 'rollup';
import cjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import jsonld from 'jsonld';
import { Headers } from 'node-fetch';
import nodeEval from 'node-eval';
import jsigs from 'jsonld-signatures';
import { MerkleProof2019 } from '../../src/MerkleProof2019';
import blockcertsDocument from '../fixtures/testnet-v3-did.json';
import didDocument from '../fixtures/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';

const { purposes: { AuthenticationProofPurpose } } = jsigs;

async function precompileVc (): Promise<string> {
  return await rollup({
    input: 'node_modules/@digitalbazaar/vc/lib/index.js',
    plugins: [
      resolve({
        preferBuiltins: true
      }),
      cjs()
    ]
  }).then(async bundle => await bundle.generate({ format: 'cjs', inlineDynamicImports: true }))
    .then(generated => {
      return generated.output[0].code;
    });
}

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
    return jsonld.documentLoader(url);
  };
  return customLoader;
}

jest.useRealTimers();

describe('Contract test suite', function () {
  describe('vc.js compatibility', function () {
    it('should verify a MerkleProof2019 signed document', async function () {
      const vcjsString = await precompileVc();
      const vcjs = nodeEval(vcjsString, './index.js', {
        globalThis: {
          Headers
        }
      });
      const suite = [new MerkleProof2019({
        document: blockcertsDocument,
        verificationMethod: didDocument.verificationMethod[0]
      })];
      const verificationStatus = await vcjs.verifyCredential({
        credential: blockcertsDocument,
        suite,
        documentLoader: generateDocumentLoader(),
        presentationPurpose: new AuthenticationProofPurpose({
          challenge: Math.random().toString().substr(2, 8)
        })
      });

      expect(verificationStatus.verified).toBe(true);
    }, 60000);
  });
});
