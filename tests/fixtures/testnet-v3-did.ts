const blockcertsV3Fixture = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    {
      Blockcerts: {
        '@id': 'bc:Blockcerts',
        '@type': '@id'
      }
    },
    'https://w3id.org/blockcerts/v3'
  ],
  id: 'urn:uuid:13172c8c-efa5-49e1-9f69-a67ba6bd9937',
  type: [
    'VerifiableCredential',
    'BlockcertsCredential'
  ],
  issuer: {
    id: 'did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ',
    name: 'Hyland Innovation Team',
    url: 'https://www.hyland.com',
    description: '',
    image: '',
    email: 'julien.fraichot@hyland.com'
  },
  issuanceDate: '2022-02-02T15:00:00Z',
  credentialSubject: {
    name: 'Julien Fraichot',
    claim: {
      type: 'Blockcerts',
      id: 'urn:uuid:41015b98-fc99-447c-b211-ef6782147fb3',
      name: 'V3 issuance',
      description: 'A v3 working example for test purposes',
      criteria: 'it has been issued'
    }
  },
  metadata: '{"classOf":"2022"}',
  display: {
    contentMediaType: 'text/html',
    content: '<div>Hello World</div>'
  },
  proof: {
    type: 'MerkleProof2019',
    created: '2022-04-05T13:43:10.870521',
    proofValue: 'z4zvrPUULnHmaio37FZuwYZDyU39wMYujJCMeypmxMWhh2XoCSMSVoeVRBKeEKUVnqccnmgggyPYLx2xubmvDCP2HWMCcTCLrcpBHJMEzUiwQrixSFStZbxQq9yPVNoYysMcxinfxZTpmH1j5mmGsC2fUP1LEMruXA1fKgupM3Ea97PzUGjgDgSfZqJNKjmFMJYL5tC1R7XoRqYvpKg3NhMrFY9YtyuERDW9do92EPeSw17j5xUZLpj6uGieJVrf5ps4AScoB4tXXTm4eFi4ZkQbbbvkRmPK9bZsyKKxGQ2Bq5cfwPbvPHiaGLSHEBrAYh75so7LwoiKi1VCw7NdsybWmMUf1E547PZhbqTB5hXJD5VBYN6hpoGzc18L6boKN1oveFaHAoFrQsEjmBJ',
    proofPurpose: 'assertionMethod',
    verificationMethod: 'did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ#key-1'
  }
};

export const documentHash = 'eca54e560dd43cccd900fa4bb9221f144d4c451c24beeddfd82e31db842bced1';
export default blockcertsV3Fixture;
