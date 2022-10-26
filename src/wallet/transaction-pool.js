class TransactionPool {
  constructor() {
    this.transactions = {};
  }

  setTransaction(transaction) {
    this.transactions[transaction.id] = transaction;
  }
}

module.exports = TransactionPool;
