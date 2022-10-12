const Blockchain = require('./blockchain');
const Block      = require('./block');

describe('Blockchain', () => {
  const blockchain = new Blockchain();

  it('contains a `chain` of `Block` instances', () => {
    expect(blockchain.chain).toBeInstanceOf(Array);
  });

  it('should start with the genesis block', () => {
    const genesisBlock = Block.genesis();
    const firstBlock   = blockchain.chain[0];

    expect(firstBlock).toEqual(genesisBlock);
  });

  it('should return the last block in the chain', () => {
    const index     = blockchain.chain.length - 1;
    const block     = blockchain.chain[index];
    const lastBlock = blockchain.lastBlock();

    expect(lastBlock).toEqual(block);
  });

  it('should add a new block to the chain', () => {
    const data = 'test';

    blockchain.addBlock({ data });

    const lastBlock = blockchain.lastBlock();

    expect(lastBlock).toBeInstanceOf(Block);
    expect(lastBlock.data).toEqual(data);
  });
});
