import jsonld from 'jsonld';
import sha256 from 'sha256';
import preloadedContexts from '../constants/contexts/preloadedContexts';
import { toUTF8Data } from '../utils/data';

// function setJsonLdDocumentLoader (): any { // not typed by jsonld
//   if (typeof window !== 'undefined' && typeof window.XMLHttpRequest !== 'undefined') {
//     return jsonld.documentLoaders.xhr();
//   }
//
//   return jsonld.documentLoaders.node();
// }

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

export default async function computeLocalHash (document: any, documentLoader = (url: string): any => null): Promise<string> { // TODO: define VC type
  const expandContext = document['@context'];
  const theDocument = JSON.parse(JSON.stringify(document));

  if (theDocument.proof) {
    // compute the document as it was signed, so without proof
    delete theDocument.proof;
  }

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

  const normalizeArgs: any = {
    algorithm: 'URDNA2015',
    format: 'application/nquads',
    documentLoader: customLoader
  };

  let normalizedDocument;

  try {
    normalizedDocument = await jsonld.normalize(theDocument, normalizeArgs);
  } catch (e) {
    console.error(e);
    throw new Error('computeLocalHash - JSONLD normalization failed');
  }

  const unmappedFields: string[] = getUnmappedFields(normalizedDocument);
  if (unmappedFields) {
    throw new Error(
      `computeLocalHash - found unmapped fields: ${unmappedFields.join(', ')}`
    );
  } else {
    return sha256(toUTF8Data(normalizedDocument));
  }
}
