const Transaction = require('./transaction');
const Wallet      = require('./wallet');

describe('Transaction', () => {
  let transaction;
  let sender;
  let recipient;
  let amount;

  beforeEach(() => {
    sender      = new Wallet();
    recipient   = 'recipient-public-key';
    amount      = 100;
    transaction = new Transaction({ sender, recipient, amount });
  });

  it('has an `id`', () => {
    expect(transaction).toHaveProperty('id');
  });

  it('has an `input`', () => {
    expect(transaction).toHaveProperty('input');
  });

  it('has an `output`', () => {
    expect(transaction).toHaveProperty('output');
  });

  describe('input', () => {
    it('includes a `timestamp`', () => {
      expect(transaction.input).toHaveProperty('timestamp');
    });

    it('includes the initial balance of the sender', () => {
      expect(transaction.input).toHaveProperty('balance', sender.balance);
    });

    it('includes the `address` of the sender', () => {
      expect(transaction.input).toHaveProperty('address', sender.publicKey);
    });

    it('includes a `signature`', () => {
      const signature = sender.sign(transaction.output);

      expect(transaction.input).toHaveProperty('signature', signature)
    });
  });

  describe('output', () => {
    it('outputs the amount to the recipient', () => {
      const output          = transaction.output;
      const recipientAmount = output[recipient];

      expect(recipientAmount).toEqual(amount);
    });

    it('outputs the remaining balance for the `sender`', () => {
      const output        = transaction.output;
      const senderBalance = output[sender.publicKey];

      expect(senderBalance).toEqual(sender.balance - amount);
    });
  });

  describe('validate()', () => {
    let errorMock;

    beforeEach(() => {
      errorMock = jest.fn();

      global.console.error = errorMock;
    });

    describe('when the transaction is valid', () => {
      it('returns true', () => {
        const valid = Transaction.validate(transaction);

        expect(valid).toBe(true);
      });
    })

    describe('when the transaction is invalid', () => {
      describe('and the output has been tainted', () => {
        it('returns false', () => {
          transaction.output[sender.publicKey] = 1000000;

          const valid = Transaction.validate(transaction);

          expect(valid).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });

      describe('and the signature is invalid', () => {
        it('returns false', () => {
          const wallet = new Wallet();

          transaction.input.signature = wallet.sign(transaction.output);

          const valid = Transaction.validate(transaction);

          expect(valid).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });
    });
  });
});
