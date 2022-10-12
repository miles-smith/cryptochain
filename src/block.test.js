const Block            = require('./block');
const { GENESIS_DATA } = require('../config');
const cryptoHash       = require('./crypto-hash');

describe('Block', () => {
  const timestamp  = new Date();
  const lastHash   = 'test-0';
  const hash       = 'test-1';
  const data       = ['blockchain', 'data'];
  const nonce      = 1;
  const difficulty = 1;
  const block      = new Block({ timestamp, lastHash, hash, data, nonce, difficulty });

  it('should have a timestamp property', () => {
    expect(block).toHaveProperty('timestamp', timestamp);
  });

  it('should have a lastHash property', () => {
    expect(block).toHaveProperty('lastHash', lastHash);
  });

  it('should have a hash property', () => {
    expect(block).toHaveProperty('hash', hash);
  });

  it('should have a data property', () => {
    expect(block).toHaveProperty('data', data);
  });

  it('should have a `difficulty` property', () => {
    expect(block).toHaveProperty('difficulty', difficulty);
  });

  it('should have a `nonce` property', () => {
    expect(block).toHaveProperty('nonce', nonce);
  });

  describe('genesis()', () => {
    const genesisBlock = Block.genesis();

    it('returns a Block instance', () => {
      expect(genesisBlock).toBeInstanceOf(Block);
    });

    it('returns the genesis data', () => {
      expect(genesisBlock).toEqual(GENESIS_DATA);
    });
  });

  describe('mine()', () => {
    const lastBlock = Block.genesis();
    const data      = 'mined data';
    const block     = Block.mine({ lastBlock, data });

    it('returns a Block instance', () => {
      expect(block).toBeInstanceOf(Block);
    });

    it('sets `lastHash` to be the `hash` of the `lastBlock`', () => {
      expect(block.lastHash).toEqual(lastBlock.hash);
    });

    it('sets the `data`', () => {
      expect(block.data).toEqual(data);
    });

    it('sets the `timestamp`', () => {
      expect(block.timestamp).toBeDefined();
    });

    it('creates a SHA256 hash based on the proper inputs', () => {
      const hash = cryptoHash(
        block.timestamp,
        block.difficulty,
        block.nonce,
        lastBlock.hash,
        data,
      );

      expect(block.hash).toEqual(hash);
    });

    it('sets a `hash` that matches the `difficulty` criteria', () => {
      const target  = '0'.repeat(block.difficulty);
      const attempt = block.hash.substring(0, block.difficulty);

      expect(attempt).toEqual(target);
    });
  });
});
