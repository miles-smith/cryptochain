const Transaction = require('./transaction');

class TransactionPool {
  constructor() {
    this.clear();
  }

  clear() {
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

  clearBlockchainTransactions({ chain }) {
    for(let i = 1; i < chain.length; i++) {
      const block = chain[i];

      for(let transaction of block.data) {
        if(this.transactions[transaction.id]) {
          delete this.transactions[transaction.id];
        }
      }
    }
  }
}

module.exports = TransactionPool;
