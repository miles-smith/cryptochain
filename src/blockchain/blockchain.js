const Block          = require('./block');
const Wallet         = require('../wallet/wallet');
const Transaction    = require('../wallet/transaction');
const { cryptoHash } = require('../utils');
const { REWARD_INPUT, MINING_REWARD } = require('../../config');

class Blockchain {
  constructor() {
    this.chain = [
      Block.genesis()
    ];
  }

  static isValidChain(chain) {
    let previousBlock;
    let currentBlock;

    previousBlock = currentBlock = chain[0];

    if(JSON.stringify(currentBlock) !== JSON.stringify(Block.genesis()))
      return false;

    for(let i = 1; i < chain.length; i++) {
      currentBlock = chain[i];

      if(previousBlock.hash !== currentBlock.lastHash)
        return false;

      const hash = cryptoHash(
        currentBlock.timestamp,
        currentBlock.lastHash,
        currentBlock.difficulty,
        currentBlock.nonce,
        currentBlock.data
      );

      if(hash !== currentBlock.hash)
        return false

      if(Math.abs(previousBlock.difficulty - currentBlock.difficulty) > 1)
        return false

      previousBlock = currentBlock;
    }

    return true
  }

  length() {
    return this.chain.length;
  }

  lastBlock() {
    const index = this.chain.length - 1;

    return this.chain[index];
  }

  addBlock({ data }) {
    const lastBlock = this.lastBlock();
    const newBlock  = Block.mine({ lastBlock, data });

    return this.chain.push(newBlock);
  }

  fetchBlock(i) {
    return this.chain[i];
  }
  
  // QUESTION: Should this be (mostly) a delegate method, and the heavy lifting done
  // on/by `Block` instances?
  // QUESTION: Should this, and related methods, accept a `Blockchain` instance as it's arg?
  validTransactionData(chain) {
    for(let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const transactionSet = new Set();
      let rewardCount = 0;

      for(let transaction of block.data) {
        if(transaction.input.address === REWARD_INPUT.address) {
          rewardCount += 1;

          if(rewardCount > 1) {
            console.error('Reward exceeds limit');
            return false;
          }

          // Reward transactions (should) only have one entry...
          if(Object.values(transaction.output)[0] !== MINING_REWARD) {
            console.error('Invalid reward');
            return false;
          }
        } else {
          if(!Transaction.validate(transaction)) {
            console.error('Invalid transaction');
            return false;
          }

          const trueBalance = Wallet.calculateBalance({ 
            address: transaction.input.address,
            blockchain: this
          });

          if(transaction.input.balance !== trueBalance) {
            console.error('Invalid balance');
            return false;
          }

          if(transactionSet.has(transaction)) {
            console.error('Duplicate transaction');
            return false;
          } else {
            transactionSet.add(transaction);
          }
        }
      }
    }

    return true;
  }

  replaceChain(chain, onSuccess) {
    if(chain.length <= this.chain.length) {
      console.error('Incoming chain not longer than current chain!');
      return;
    }

    if(!Blockchain.isValidChain(chain)) {
      console.error('Incoming chain is invalid!');
      return;
    }

    if(!this.validTransactionData(chain)) {
      console.error('Incoming chain has invalid transaction data!');
      return;
    }

    if(onSuccess)
      onSuccess();

    console.log('Replacing chain with', chain);
    return this.chain = chain;
  }
}

module.exports = Blockchain;
