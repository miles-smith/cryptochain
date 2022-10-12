const Block      = require('./block');
const cryptoHash = require('./crypto-hash');

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

      const hash = cryptoHash(currentBlock.timestamp, currentBlock.lastHash, currentBlock.data);

      if(hash !== currentBlock.hash)
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
}

module.exports = Blockchain;
