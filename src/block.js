const hexToBinary = require('hex-to-binary');
const { GENESIS_DATA, MINE_RATE } = require('../config');
const cryptoHash = require('./crypto-hash');

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
    const lastHash = lastBlock.hash;

    let difficulty = lastBlock.difficulty;
    let nonce      = 0;

    let timestamp, hash, target, binaryHash, attempt;

    do {
      nonce++;

      timestamp  = Date.now();
      difficulty = this.adjustDifficulty({ block: lastBlock, timestamp });
      target     = '0'.repeat(difficulty);
      hash       = cryptoHash(timestamp, lastHash, data, difficulty, nonce);
      binaryHash = hexToBinary(hash);
      attempt    = binaryHash.substring(0, difficulty);
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

  static adjustDifficulty({ block, timestamp }) {
    const delta      = timestamp - block.timestamp;
    const correction = delta > MINE_RATE ? -1 : 1;

    return Math.max(1, block.difficulty + correction);
  }
}

module.exports = Block;
