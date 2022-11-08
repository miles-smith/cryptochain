const TransactionPool = require('./transaction-pool');
const Transaction     = require('./transaction');
const Wallet          = require('./wallet');

describe('TransactionPool', () => {
  let transactionPool;
  let transaction;
  let wallet;

  beforeEach(() => {
    wallet          = new Wallet();
    transactionPool = new TransactionPool();
    transaction     = new Transaction({
      sender:    wallet,
      recipient: 'test-recipient-public-key',
      amount:    1
    });
  });

  describe('setTransaction()', () => {
    it('adds a transaction', () => {
      transactionPool.setTransaction(transaction);

      expect(transactionPool.transactions).toHaveProperty(transaction.id);
      expect(transactionPool.transactions[transaction.id]).toBe(transaction);
    });
  });

  describe('findBySender()', () => {
    it('returns an existing transaction', () => {
      transactionPool.setTransaction(transaction);

      const matchingTransaction = transactionPool.findBySender({ sender: wallet.publicKey });

      expect(matchingTransaction).toBe(transaction);
    });
  });

  describe('validTransactions()', () => {
    let transactions;
    let errorMock;

    beforeEach(() => {
      const otherWallet = new Wallet();

      transactions = [];
      errorMock    = jest.fn();

      global.console.error = errorMock;

      for(let i = 0; i < 10; i++) {
        const recipient = `test-recipient-${i}-public-key`;

        transaction = new Transaction({
          sender:    wallet,
          recipient: recipient,
          amount:    1
        });

        switch(i % 3) {
          // invalidate ~33% of the transactions with bogus amounts...
          case 0:
            transaction.output[recipient] = wallet.balance + 1000000;
            break;
          // invalidate ~33% of the transactions with bad signatures...
          case 1:
            transaction.input.signature = otherWallet.sign('test');
            break;
          default:
            transactions.push(transaction);
        }

        transactionPool.setTransaction(transaction);
      }
    });

    it('returns valid transactions', () => {
      const validTransactions = transactionPool.validTransactions();

      expect(validTransactions).toEqual(transactions);
    });
  });
});
