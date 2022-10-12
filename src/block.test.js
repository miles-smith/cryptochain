const Block = require('./block');
const { GENESIS_DATA } = require('../config');

describe('Block', () => {
  const timestamp = new Date();
  const lastHash  = 'test-0';
  const hash      = 'test-1';
  const data      = ['blockchain', 'data'];
  const block     = new Block({ timestamp, lastHash, hash, data});

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

  describe('genesis()', () => {
    const genesisBlock = Block.genesis();

    it('returns a Block instance', () => {
      expect(genesisBlock).toBeInstanceOf(Block);
    });

    it('returns the genesis data', () => {
      expect(genesisBlock).toEqual(GENESIS_DATA);
    });
  });
});
