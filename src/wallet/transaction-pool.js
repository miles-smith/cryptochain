class TransactionPool {
  constructor() {
    this.transactions = {};
  }

  setTransaction(transaction) {
    this.transactions[transaction.id] = transaction;
  }

  findBySender({ sender }) {
    const transactions = Object.values(this.transactions);

    return transactions.find((transaction) => transaction.input.address === sender );
  }
}

module.exports = TransactionPool;
