import Proof from '../../src/models/Proof';

export const assertionTransactionId = '0xfdc9956953feee55a356b828a81791c6b8f1c743cc918457b7dc6ccf810544a1';

const decodedProof: Proof = {
  anchors: [`blink:eth:ropsten:${assertionTransactionId}`],
  merkleRoot: '2b065c69c70432e9f082629939733afd2343e83f45939519986e9a09cf8ccd08',
  path: [{ left: '6ad52e9db922e0c2648ce8f88f94b7e376daf9af60a7c782db75011f3783ea0a' }],
  targetHash: '5a44e794431569f4b50a44336c3d445085f09ac5785e38e133385fb486ada9c5'
};

export default decodedProof;
