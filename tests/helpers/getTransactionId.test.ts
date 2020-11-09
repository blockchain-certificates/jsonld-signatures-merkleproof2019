import getTransactionId from '../../src/helpers/getTransactionId';
import decodedProof, { assertionTransactionId } from '../assertions/proof';

describe('getTransactionId test suite', function () {
  describe('given it is called with a proof', function () {
    it('should return the assertionTransactionId', function () {
      const transactionId: string = getTransactionId(decodedProof);
      expect(transactionId).toBe(assertionTransactionId);
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
