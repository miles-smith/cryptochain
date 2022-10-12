const Block = require('./block');

class Blockchain {
  constructor() {
    this.chain = [
      Block.genesis()
    ];
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
}

module.exports = Blockchain;
