const Wallet              = require('./wallet');
const Transaction         = require('./transaction');
const { INITIAL_BALANCE } = require('../../config');
const { verifySignature } = require('../utils');

describe('Wallet', () => {
  let wallet;

  beforeEach(() => {
    wallet = new Wallet();
  });

  it('has a `balance`', () => {
    expect(wallet).toHaveProperty('balance', INITIAL_BALANCE);
  });

  it('has a `publicKey`', () => {
    expect(wallet).toHaveProperty('publicKey');
  });

  describe('signing data', () => {
    const data = 'test';

    it('verifies a valid signature', () => {
      const signature    = wallet.sign(data);
      const verification = verifySignature({ publicKey: wallet.publicKey, data, signature });

      expect(verification).toBe(true);
    });

    it('does not verify an invalid signature', () => {
      const otherWallet  = new Wallet();
      const signature    = otherWallet.sign(data);
      const verification = verifySignature({ publicKey: wallet.publicKey, data, signature });

      expect(verification).toBe(false);
    });
  });

  describe('createTransaction()', () => {
    let recipient = 'test-recipient';

    describe('and the amount exceeds the balance', () => {
      it('throws an error', () => {
        const amount = wallet.balance + 1;

        expect(() => wallet.createTransaction({ recipient , amount }))
          .toThrow('Insufficient funds!');
      });
    })

    describe('and there is sufficient balance', () => {
      let transaction;
      let amount;

      beforeEach(() => {
        amount      = wallet.balance - 1;
        transaction = wallet.createTransaction({ recipient, amount });
      });

      it('creates a `Transaction`', () => {
        expect(transaction).toBeInstanceOf(Transaction);
      });

      it('matches the transaction input with the wallet', () => {
        expect(transaction.input.address).toEqual(wallet.publicKey);
      });

      it('oututs the amount to the recipient', () => {
        expect(transaction.output[recipient]).toEqual(amount);
      });
    });
  });
});
