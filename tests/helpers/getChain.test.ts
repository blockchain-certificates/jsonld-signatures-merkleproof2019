import { BLOCKCHAINS } from '../../src/constants/blockchains';
import getChain from '../../src/helpers/getChain';
import { DecodedProof } from '../../src/models/Proof';

describe('getChain test suite', function () {
  describe('given it is called with a MerkleProof2019 signature', function () {
    describe('and the chain is bitcoin', function () {
      describe('and the network is mainnet', function () {
        it('should return bitcoin mainnet value', function () {
          const fixtureSignature: DecodedProof = {
            anchors: [
              'blink:btc:mainnet:0xfaea9061b06ff532d96ad91bab89fdfab900ae7d4524161431dc88318216435a'
            ],
            targetHash: 'a-target-hash',
            path: [{ left: 'a-path' }],
            merkleRoot: 'a-merkle-root'
          };
          const result = getChain(fixtureSignature);
          const chainAssertion = BLOCKCHAINS.bitcoin;
          expect(result).toEqual(chainAssertion);
        });
      });

      describe('and the network is testnet', function () {
        it('should return bitcoin testnet value', function () {
          const fixtureSignature: DecodedProof = {
            anchors: [
              'blink:btc:testnet:0xfaea9061b06ff532d96ad91bab89fdfab900ae7d4524161431dc88318216435a'
            ],
            targetHash: 'a-target-hash',
            path: [{ left: 'a-path' }],
            merkleRoot: 'a-merkle-root'
          };
          const result = getChain(fixtureSignature);
          const chainAssertion = BLOCKCHAINS.testnet;
          expect(result).toEqual(chainAssertion);
        });
      });
    });

    describe('and the chain is ethereum', function () {
      describe('and the network is mainnet', function () {
        it('should return ethereum mainnet value', function () {
          const fixtureSignature: DecodedProof = {
            anchors: [
              'blink:eth:mainnet:0xfaea9061b06ff532d96ad91bab89fdfab900ae7d4524161431dc88318216435a'
            ],
            targetHash: 'a-target-hash',
            path: [{ left: 'a-path' }],
            merkleRoot: 'a-merkle-root'
          };
          const result = getChain(fixtureSignature);
          const chainAssertion = BLOCKCHAINS.ethmain;
          expect(result).toEqual(chainAssertion);
        });
      });

      describe('and the network is ropsten', function () {
        it('should return ethereum ropsten value', function () {
          const fixtureSignature: DecodedProof = {
            anchors: [
              'blink:eth:ropsten:0xfaea9061b06ff532d96ad91bab89fdfab900ae7d4524161431dc88318216435a'
            ],
            targetHash: 'a-target-hash',
            path: [{ left: 'a-path' }],
            merkleRoot: 'a-merkle-root'
          };
          const result = getChain(fixtureSignature);
          const chainAssertion = BLOCKCHAINS.ethropst;
          expect(result).toEqual(chainAssertion);
        });
      });

      describe('and the network is rinkeby', function () {
        it('should return ethereum rinkeby value', function () {
          const fixtureSignature: DecodedProof = {
            anchors: [
              'blink:eth:rinkeby:0xfaea9061b06ff532d96ad91bab89fdfab900ae7d4524161431dc88318216435a'
            ],
            targetHash: 'a-target-hash',
            path: [{ left: 'a-path' }],
            merkleRoot: 'a-merkle-root'
          };
          const result = getChain(fixtureSignature);
          const chainAssertion = BLOCKCHAINS.ethrinkeby;
          expect(result).toEqual(chainAssertion);
        });
      });
    });
  });

  describe('given it is called without a signature', function () {
    it('should return null', function () {
      const result = getChain();
      expect(result).toBe(null);
    });
  });
});
