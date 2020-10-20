# jsonld-signatures-merkleproof2019
A jsonld signature implementation to support MerkleProof2019 verification in Verifiable Credential context

## NOTE

To make use of this package, consumers need to modify the [security-context](https://www.npmjs.com/package/security-context) 
package locally as MerkleProof2019 is not yet a registered signature mechanism. A PR is currently pending approval for merging
into the V3 vocab.

## Usage

This package is currently designed to work with [vc.js](https://github.com/digitalbazaar/vc-js) in order to 
verify Blockcerts V3 (based on the Verifiable Credentials specs) definitions.
  
You will need to wrap the certificate with the Signature Suite:

```js
    const myBlockcertsV3Definition = {
        ...
    };

    const verificationSuite = new MerkleProof2019({ blockcertsDocument: myBlockcertsV3Definition });
```

In the case of vc.js, you would then pass this suite to the `verify` method, through the `suite` parameter.

## Under the hood
The verification principle of MerkleProof2019 is to compare the distant hash of the document 
(the one saved on the blockchain) with the hash of the local document being verified.

Since this is what [cert-verifier-js](https://github.com/blockchain-certificates/cert-verifier-js) also does, we are 
leveraging the existing logic to be used by this package.

## TODO
Since the point above is doing a bit more than it should (the verification of the blockcerts would also 
encompass things like issuer profile and credential status), it could be good to abstract the part about proof verification
in this package only and make cert-issuer-js a consumer of this package, rather than the other way around. 

However one could argue that verifying the whole document is also valid, especially that vc.js (for instance) wouldn't 
necessarily know how to verify the business rules of a blockcerts v3.
 
