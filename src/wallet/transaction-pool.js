const Transaction = require('./transaction');

class TransactionPool {
  constructor() {
    this.transactions = {};
  }

  rehydrate(transactions) {
    this.transactions = transactions;
  }

  setTransaction(transaction) {
    this.transactions[transaction.id] = transaction;
  }

  findBySender({ sender }) {
    const transactions = Object.values(this.transactions);

    return transactions.find((transaction) => transaction.input.address === sender );
  }

  validTransactions() {
    return(
      Object.values(this.transactions)
        .filter(transaction => Transaction.validate(transaction))
    );
  }
}

module.exports = TransactionPool;
