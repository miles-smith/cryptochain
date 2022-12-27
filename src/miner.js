const Transaction = require('./wallet/transaction');

class Miner {
  constructor({ blockchain, transactionPool, wallet, pubsub }) {
    this.blockchain      = blockchain;
    this.transactionPool = transactionPool;
    this.wallet          = wallet;
    this.pubsub          = pubsub;
  }

  mineTransactions() {
    // Get the valid transactions from the `transactionPool`
    const validTransactions = this.transactionPool.validTransactions();
    
    // Generate reward for mining
    validTransactions.push(
      Transaction.rewardTransaction({ wallet: this.wallet })
    );

    // Add block of mined transaction to the `blockchain`
    this.blockchain.addBlock({ data: validTransactions });

    // Broadcast the updated `blockchain`
    this.pubsub.broadcastChain();

    // Clear the `transactionPool`
    this.transactionPool.clear();
  }
}

module.exports = Miner;
