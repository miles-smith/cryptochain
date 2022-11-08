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
});
