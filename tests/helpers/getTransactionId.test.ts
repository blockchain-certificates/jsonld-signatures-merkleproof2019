import getTransactionId from '../../src/helpers/getTransactionId';
import decodedProof from '../assertions/proof';

describe('getTransactionId test suite', function () {
  describe('given it is called with a proof', function () {
    it('should return the transactionId', function () {
      const transactionId: string = getTransactionId(decodedProof);
      expect(transactionId).toBe('0xfdc9956953feee55a356b828a81791c6b8f1c743cc918457b7dc6ccf810544a1');
    });
  });

  describe('given it is called with an invalid proof', function () {
    describe('when it is not set', function () {
      it('should throw an error', function () {
        expect(() => {
          getTransactionId(null);
        }).toThrow('Proof is not set');
      });
    });

    describe('when the anchor is not an array', function () {
      it('should throw an error', function () {
        expect(() => {
          const invalidProof = {
            anchors: {
              target: 'invalidData'
            }
          };
          getTransactionId(invalidProof as any);
        }).toThrow('Could not retrieve transaction id as was provided an unexpected format');
      });
    });

    describe('when the anchor value is not a string', function () {
      it('should throw an error', function () {
        expect(() => {
          const invalidProof = {
            anchors: [{ target: 'invalidData' }]
          };
          getTransactionId(invalidProof as any);
        }).toThrow('Could not retrieve transaction id as was provided an unexpected format');
      });
    });
  });
});
