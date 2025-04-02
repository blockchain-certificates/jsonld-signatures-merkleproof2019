import { describe, it, expect } from 'vitest';
import isTransactionIdValid from '../../src/inspectors/isTransactionIdValid';

describe('Inspectors test suite', function () {
  describe('isTransactionIdValid method', function () {
    const errorMessage = 'Cannot verify this certificate without a transaction ID to compare against.';

    describe('given assertionTransactionId is a string with characters', function () {
      it('should return the assertionTransactionId', function () {
        const transactionIdFixture = 'transaction-id';
        const result = isTransactionIdValid(transactionIdFixture);
        expect(result).toBe(transactionIdFixture);
      });
    });

    describe('given assertionTransactionId is not a string', function () {
      it('throw an error', function () {
        const transactionIdFixture = 1 as any;
        expect(() => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          isTransactionIdValid(transactionIdFixture);
        }).toThrow(errorMessage);
      });
    });

    describe('given assertionTransactionId is an empty string', function () {
      it('throw an error', function () {
        const transactionIdFixture = '';
        expect(() => {
          isTransactionIdValid(transactionIdFixture);
        }).toThrow(errorMessage);
      });
    });
  });
});
