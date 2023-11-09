import jsonld from 'jsonld';
import sha256 from 'sha256';
import preloadedContexts from '../constants/contexts/preloadedContexts';
import { toUTF8Data } from '../utils/data';
import { isObject } from '../utils/object';
import VerifierError from '../models/VerifierError';
import getText from '../helpers/getText';

export function getUnmappedFields (normalized: string): string[] | null {
  const normalizedArray = normalized.split('\n');
  const myRegexp = /<http:\/\/fallback\.org\/(.*)>/;
  const matches = normalizedArray
    .map(normalizedString => myRegexp.exec(normalizedString))
    .filter(match => match != null);
  if (matches.length > 0) {
    // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
    const unmappedFields = matches.map(match => match[1]).sort(); // only return name of unmapped key
    return Array.from(new Set(unmappedFields)); // dedup
  }
  return null;
}

export default async function computeLocalHash (
  document: any,
  targetProof = null,
  documentLoader = async (url: string) => Promise<any>
): Promise<string> { // TODO: define VC type
  // the previous implementation was using a reference of @context, thus always adding @vocab to @context,
  // thus passing the information down to jsonld regardless of the configuration option. We explicitly do that now,
  // since we want to make sure unmapped fields are detected.
  if (!document['@context'].find((context: any) => isObject(context) && '@vocab' in context)) {
    document['@context'].push({ '@vocab': 'http://fallback.org/' });
  }
  const theDocument = JSON.parse(JSON.stringify(document));

  if (!Array.isArray(theDocument.proof)) {
    // compute the document as it was signed, so without proof
    delete theDocument.proof;
  } else {
    if (!targetProof) {
      throw new VerifierError(
        'computeLocalHash',
        getText('errors', 'noProofSpecified')
      );
    }
    const proofIndex = theDocument.proof.findIndex(proof => proof.proofValue === targetProof.proofValue);
    theDocument.proof = theDocument.proof.slice(0, proofIndex);
  }

  const customLoader = async function (url: string): Promise<any> {
    if (documentLoader != null) {
      await documentLoader(url);
    }
    if (url in preloadedContexts) {
      return {
        contextUrl: null,
        document: preloadedContexts[url],
        documentUrl: url
      };
    }
    return (jsonld as any).documentLoader(url);
  };

  const normalizeArgs: any = {
    algorithm: 'URDNA2015',
    format: 'application/nquads',
    documentLoader: customLoader,
    safe: false
  };

  let normalizedDocument;

  try {
    normalizedDocument = await (jsonld as any).normalize(theDocument, normalizeArgs);
  } catch (e: any) {
    console.error(e);
    throw new VerifierError('computeLocalHash', getText('errors', 'failedJsonLdNormalization'));
  }

  const unmappedFields: string[] = getUnmappedFields(normalizedDocument);
  if (unmappedFields) {
    throw new VerifierError(
      'computeLocalHash',
      `${getText('errors', 'foundUnmappedFields')}: ${unmappedFields.join(', ')}`
    );
  } else {
    return sha256(toUTF8Data(normalizedDocument));
  }
}
