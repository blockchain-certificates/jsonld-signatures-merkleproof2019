import { ethereumRPCParsingFunction } from '../../../src/explorers/rpc/ethereum';

describe('Ethereum RPC response parsing test suite', function () {
  describe('given it is called with a transactionId and a server URL', function () {
    it('should retrieve the transaction data', async function () {
      const transactionId = '0xef59c07bed26d473925e688ec4da2211981820dc1167427ef34d2a2e6f45b8fa';
      const serverUrl = 'https://rpc-mumbai.maticvigil.com/';

      const output = await ethereumRPCParsingFunction(serverUrl, transactionId);
      expect(output).toEqual({
        remoteHash: '7122cbe07bafd8c243e8c2b684b38e32cc2493365d7ced1e7f1160cf99be835a',
        issuingAddress: '0x11f1089baceaa98dbe22c079c9df1e2338af22e1',
        time: new Date('2020-09-22T14:20:31.000Z'),
        revokedAddresses: []
      });
    });
  });
});
