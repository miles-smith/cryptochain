const Block          = require('./block');
const { cryptoHash } = require('../utils');

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

  lastBlock() {
    const index = this.chain.length - 1;

    return this.chain[index];
  }

  addBlock({ data }) {
    const lastBlock = this.lastBlock();
    const newBlock  = Block.mine({ lastBlock, data });

    return this.chain.push(newBlock);
  }

  replaceChain(chain) {
    if(chain.length <= this.chain.length) {
      console.error('Incoming chain not longer than current chain!');
      return;
    }

    if(!Blockchain.isValidChain(chain)) {
      console.error('Incoming chain is invalid!');
      return;
    }

    console.log('Replacing chain with', chain);
    return this.chain = chain;
  }
}

module.exports = Blockchain;
