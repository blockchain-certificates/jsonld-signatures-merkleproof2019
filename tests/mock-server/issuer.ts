import express from 'express';
import fixture from '../fixtures/mocknet-vc-v2-data-integrity-proof.json';
const server = express();


server.post('/credentials/issue', (req, res) => {
  console.log('mock server received a request to issue a credential');
  res.send(JSON.stringify({
    verifiableCredential: fixture
  }));
});

server.listen(3002, () => { console.log('Mock server is running on port 3002'); });
