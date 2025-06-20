# jsonld-signatures-merkleproof2019
A jsonld signature implementation to support MerkleProof2019 verification in Verifiable Credential context

## NOTE

To make use of this package, consumers need to modify the [security-context](https://www.npmjs.com/package/security-context) 
package locally as MerkleProof2019 is not part of the current npm distribution. Another solution is to install from github and use the v3-unstable vocab.

## Usage

This package is works with [vc.js](https://github.com/digitalbazaar/vc-js) in order to issue and 
verify MerkleProof2019 signed documents.
It is also used in [cert-verifier-js](https://github.com/blockchain-certificates/cert-verifier-js) 
to verify MerkleProof2019 signed documents within the Blockcerts ecosystem.
  
You will need to wrap the certificate with the Signature Suite:

```js
    const myBlockcertsV3Definition = {
  ...
};

const verificationSuite = new LDMerkleProof2019({document: myBlockcertsV3Definition});
```

In the case of vc.js, you would then pass this suite to the `verify` method, through the `suite` parameter.

## Issue
To issue a MerkleProof2019 signed document, you can call `vcjs.issue` with an instance of this library as
the `suite` parameter.

When instantiating the suite, you need to specify the `issuerEndpoint` as part of the `options` parameter.

It is expected that the `issuerEndpoint` is a URL that points to the issuing service, which will be used to create the Merkle proof.

You may use [cert-issuer](https://github.com/blockchain-certificates/cert-verifier-js) as a server to satisfy this requirement, 
or you can implement your own issuing service.

For convenience, we provide a VC-API issuing service: [cert-issuer-vc-api](https://github.com/blockchain-certificates/cert-issuer-vc-api).


## Under the hood
The verification principle of MerkleProof2019 is to compare the distant hash of the document 
(the one saved on the blockchain) with the hash of the local document being verified.

## Anchoring chains
MerkleProof2019 verification as provided by Blockcerts does out of the box verification for Bitcoin (mainnet and testnet) and Ethereum (main and tests), using a set of
public explorers.

### REST APIs
By default this library provides some blockchain explorers to retrieve the transaction data associated with a proof. They are:
- For Bitcoin
    - [Bitpay](https://bitpay.com/insight)
    - [Blockcypher](https://blockcypher.com)
    - [Blockexplorer](https://blockexplorer.com). To confirm if still active
    - [Blockstream](https://blockstream.info)
- For Ethereum
    - [Blockcypher](https://blockcypher.com)
    - [Etherscan](https://etherscan.io/)


You may provide your own explorer or even overwrite the existing ones. This is useful if you have a paid account with one explorer service and you want to ensure a high service availability,
or if you'd like to provide identification keys to the ones provided by default.

Here is an example of how you would provide such service:

```js
    const myBlockcertsV3Definition = {
  ...
};

const myOwnExplorerAPI: ExplorerAPI = {
  serviceURL: 'path/to/distant/api', // you may need to provide identification details here according to your service pattern
  priority: 0, // this is to decide if this gets called before the out-of-the-box services. 0 means your custom service is going to be called first, use 1 if you prefer the default explorers to be called first.
  parsingFunction: function ({jsonResponse: serviceReponse}: IParsingFunctionAPI): TransactionData { // only define this function when referring to a custom explorer
    // parse your service response in order to return the following information:
    return {
      remoteHash,
      issuingAddress,
      time,
      revokedAddresses
    }
  }
};
const options = {
  explorerAPIs: [myOwnExplorerAPI]
};

const verificationSuite = new LDMerkleProof2019({document: myBlockcertsV3Definition, options});
```

## RPCs
In an alpha implementation, it is now possible to verify transaction of non natively supported chains, using RPC calls.
If such is your case, 2 options are offered to you:

#### Your chain is compatible with EVM or BTC
In that case you can take advantage of the built-ins lookup functions. You only need to provide the url to the RPC service you want to use and the `chainType` property to decide which
lookup function to use:

```js
    const myBlockcertsV3Definition = {
  ...
};

const options = {
  explorerAPIs: [{
    serviceURL: 'https://rpc-mumbai.maticvigil.com/',
    priority: 0,
    apiType: 'rpc',
    chainType: 'evm'
  }]
};
const verificationSuite = new LDMerkleProof2019({document: myBlockcertsV3Definition, options});
```

#### Your chain is not compatible with EVM or BTC
NOTE: you can use this approach to modify the provided RPC lookup functions.

You will need to additionally provide your own lookup function. Contrary to rest APIs in this package, the parsing function needs to make the calls to the RPC service by itself.

```js
    const myBlockcertsV3Definition = {
  ...
};

const options = {
  explorerAPIs: [{
    serviceURL: 'https://rpc-mumbai.maticvigil.com/',
    priority: 0,
    apiType: 'rpc',
    chainType: 'evm',
    parsingFunction: function ({serverUrl, transactionId}: IParsingFunctionAPI): TransactionData { // note that function signature is different than for REST parsingFunctions
      // your call to the `serverUrl` with the `transaction` id
      // parse your service response in order to return the following information:
      return {
        remoteHash,
        issuingAddress,
        time,
        revokedAddresses
      }
    }
  }]
};
const verificationSuite = new LDMerkleProof2019({document: myBlockcertsV3Definition, options});
```
