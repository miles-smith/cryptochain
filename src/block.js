const { GENESIS_DATA } = require('../config');
const cryptoHash       = require('./crypto-hash');

class Block {
  constructor({ timestamp, lastHash, hash, data, difficulty, nonce }) {
    this.timestamp  = timestamp;
    this.lastHash   = lastHash;
    this.hash       = hash;
    this.data       = data;
    this.difficulty = difficulty;
    this.nonce      = nonce;
  }

  static genesis() {
    return new this(GENESIS_DATA);
  }

  static mine({ lastBlock, data }) {
    const lastHash   = lastBlock.hash;
    const difficulty = lastBlock.difficulty;
    const target     = '0'.repeat(difficulty);

    let timestamp, hash, attempt;
    let nonce = 0

    do {
      nonce++;

      timestamp = Date.now();
      hash      = cryptoHash(timestamp, lastHash, data, difficulty, nonce);
      attempt   = hash.substring(0, difficulty);
    } while (attempt !== target)

    return new this({
      timestamp,
      lastHash,
      difficulty,
      nonce,
      hash,
      data,
    });
  }
}

module.exports = Block;
