import isMockChain from '../../src/helpers/isMockChain';
import { BLOCKCHAINS } from '@blockcerts/explorer-lookup';

describe('domain chains isMockChain use case test suite', function () {
  describe('given it is called with a chain parameter', function () {
    describe('given the chain does not exist', function () {
      it('should return null', function () {
        const assertionInvalidChain = 'invalid-chain';
        const result = isMockChain(assertionInvalidChain);
        expect(result).toBe(false);
      });
    });

    describe('given the chain parameter is passed as a string and is a valid test chain', function () {
      it('should return true', function () {
        const assertionTestChain = BLOCKCHAINS.mocknet.code;
        const result = isMockChain(assertionTestChain);
        expect(result).toBe(true);
      });
    });

    describe('given the chain is passed as an object and is a valid test chain', function () {
      describe('given the chain is Mocknet', function () {
        it('should return true', function () {
          const assertionTestChain = BLOCKCHAINS.mocknet;
          const result = isMockChain(assertionTestChain);
          expect(result).toBe(true);
        });
      });

      describe('given the chain is Testnet', function () {
        it('should return false', function () {
          const assertionTestChain = BLOCKCHAINS.testnet;
          const result = isMockChain(assertionTestChain);
          expect(result).toBe(false);
        });
      });

      describe('given the chain is Regtest', function () {
        it('should return true', function () {
          const assertionTestChain = BLOCKCHAINS.regtest;
          const result = isMockChain(assertionTestChain);
          expect(result).toBe(true);
        });
      });
    });

    describe('given the chain is a valid main chain', function () {
      it('should return false', function () {
        const assertionTestChain = BLOCKCHAINS.bitcoin;
        const result = isMockChain(assertionTestChain);
        expect(result).toBe(false);
      });
    });

    describe('given the chain is null', function () {
      it('should return null', function () {
        const result = isMockChain(null);
        expect(result).toBe(false);
      });
    });
  });

  describe('given it is not called with a chain parameter', function () {
    it('should return null', function () {
      // @ts-expect-error no parameter is the test
      const result = isMockChain();
      expect(result).toBe(false);
    });
  });
});
