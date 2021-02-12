import jsonld from 'jsonld';
import JsonLdError from 'jsonld/lib/JsonLdError';
import sha256 from 'sha256';
import { CONTEXTS as ContextsMap } from '../constants/contexts';
import { toUTF8Data } from '../utils/data';

const {
  blockcertsV3: BLOCKCERTSV3_CONTEXT,
  verifiableCredential: VERIFIABLE_CREDENTIAL_CONTEXT,
  verifiableCredentialExample: VERIFIABLE_CREDENTIAL_EXAMPLE,
  merkleProof2019: MERKLE_PROOF_2019,
  odrl: OPEN_DIGITALS_RIGHTS_LANGUAGE
} = ContextsMap;
const CONTEXTS = {};

CONTEXTS['https://www.blockcerts.org/schema/3.0-alpha/context.json'] = BLOCKCERTSV3_CONTEXT;
CONTEXTS['https://www.w3id.org/blockcerts/schema/3.0-alpha/context.json'] = BLOCKCERTSV3_CONTEXT;
CONTEXTS['https://www.w3.org/2018/credentials/v1'] = VERIFIABLE_CREDENTIAL_CONTEXT;
CONTEXTS['https://www.w3.org/2018/credentials/examples/v1'] = VERIFIABLE_CREDENTIAL_EXAMPLE;
CONTEXTS['https://www.w3id.org/blockcerts/schema/3.0-alpha/merkleProof2019Context.json'] = MERKLE_PROOF_2019;
CONTEXTS['https://www.blockcerts.org/schema/3.0-alpha/merkleProof2019Context.json'] = MERKLE_PROOF_2019;
CONTEXTS['https://www.w3.org/ns/odrl.jsonld'] = OPEN_DIGITALS_RIGHTS_LANGUAGE;

function setJsonLdDocumentLoader (): any { // not typed by jsonld
  if (typeof window !== 'undefined' && typeof window.XMLHttpRequest !== 'undefined') {
    return jsonld.documentLoaders.xhr();
  }

  return jsonld.documentLoaders.node();
}

export default async function computeLocalHash (document: any, documentLoader = (url: string): any => null): Promise<string> { // TODO: define VC type
  const expandContext = document['@context'];
  const theDocument = JSON.parse(JSON.stringify(document));

  if (theDocument.proof) {
    // compute the document as it was signed, so without proof
    delete theDocument.proof;
  }

  const jsonldDocumentLoader = setJsonLdDocumentLoader();
  const customLoader = async function (url, callback): Promise<any> { // Not typed by JSONLD
    const context = await documentLoader(url);
    if (context) {
      return callback(null, context);
    }

    if (url in CONTEXTS) {
      return callback(null, {
        contextUrl: null,
        document: CONTEXTS[url],
        documentUrl: url
      });
    }
    return jsonldDocumentLoader(url, callback);
  };
  jsonld.documentLoader = customLoader;
  const normalizeArgs: any = {
    algorithm: 'URDNA2015',
    format: 'application/nquads'
  };
  if (expandContext) {
    normalizeArgs.expandContext = expandContext;
  }

  return await new Promise((resolve, reject) => {
    jsonld.normalize(theDocument, normalizeArgs, (err: JsonLdError, normalized) => {
      const isErr = !!err;
      if (isErr) {
        console.log('error', err);
        reject(
          new JsonLdError(
            'Failed to normalize document',
            err.name,
            err.details
          )
        );
      } else {
        resolve(sha256(toUTF8Data(normalized)));
      }
    });
  });
}
