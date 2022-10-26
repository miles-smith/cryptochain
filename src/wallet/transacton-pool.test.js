const TransactionPool = require('./transaction-pool');
const Transaction     = require('./transaction');
const Wallet          = require('./wallet');

describe('TransactionPool', () => {
  let transactionPool;
  let transaction;

  beforeEach(() => {
    transactionPool = new TransactionPool();
    transaction     = new Transaction({
      sender:    new Wallet(),
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
  })
});
