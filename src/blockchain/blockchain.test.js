const cryptoHash = require('../utils/crypto-hash');
const Blockchain = require('./blockchain');
const Block      = require('./block');

describe('Blockchain', () => {
  let blockchain;

  beforeEach(() => {
    blockchain = new Blockchain();
  });

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

  describe('isValidChain()', () => {
    describe('when the chain does not begin with the genesis block', () => {
      it('returns false', () => {
        blockchain.chain[0] = { data: 'not-the-genesis-block' };

        const valid = Blockchain.isValidChain(blockchain.chain);

        expect(valid).toBe(false);
      });
    });

    describe('when the chain begins with the genesis block and has multiple blocks', () => {
      beforeEach(() => {
        blockchain.addBlock({ data: 'test-1' });
        blockchain.addBlock({ data: 'test-2' });
        blockchain.addBlock({ data: 'test-3' });
      })

      describe('and the chain does not contain invalid blocks', () => {
        it('returns true', () => {
          const valid = Blockchain.isValidChain(blockchain.chain);

          expect(valid).toBe(true);
        });
      });

      describe('and a `lastHash` reference has changed', () => {
        it('returns false', () => {
          blockchain.chain[2].lastHash = 'tampered lastHash';

          const valid = Blockchain.isValidChain(blockchain.chain);

          expect(valid).toBe(false);
        });
      });

      describe('and the chain contains a block with an invalid field', () => {
        it('returns false', () => {
          blockchain.chain[2].data = 'bad-data';

          const valid = Blockchain.isValidChain(blockchain.chain);

          expect(valid).toBe(false);
        });
      });

      describe('and the chain contains a block with a jumped difficulty', () => {
        it('returns false', () => {
          const lastBlock  = blockchain.lastBlock();
          const lastHash   = lastBlock.hash;
          const timestamp  = Date.now();
          const nonce      = 0;
          const data       = [];
          const difficulty = lastBlock.difficulty - 3;

          const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);

          const badBlock = new Block({
            timestamp,
            lastHash,
            difficulty,
            nonce,
            hash,
            data,
          });

          blockchain.chain.push(badBlock);

          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });
    });
  });

  describe('replaceChain()', () => {
    let incomingBlockchain;
    let chainBeforeReplace;

    let errorMock,logMock;

    beforeEach(() => {
      incomingBlockchain = new Blockchain();
      chainBeforeReplace = blockchain.chain;
    });

    beforeEach(() => {
      errorMock = jest.fn();
      logMock   = jest.fn();

      global.console.error = errorMock;
      global.console.log   = logMock;
    });

    describe('when the new chain is not longer', () => {
      beforeEach(() => {
        blockchain.addBlock({ data: 'test-0' });
        incomingBlockchain.addBlock({ data: 'test-1' });

        blockchain.replaceChain(incomingBlockchain.chain);
      });

      it('does not replace the chain', () => {
        expect(blockchain.chain).toEqual(chainBeforeReplace);
      });

      it('logs an error', () => {
        expect(errorMock).toHaveBeenCalled();
      });
    });

    describe('when the new chain is longer', () => {
      beforeEach(() => {
        incomingBlockchain.addBlock({ data: 'test-1' });
        incomingBlockchain.addBlock({ data: 'test-2' });
        incomingBlockchain.addBlock({ data: 'test-3' });
      })

      describe('and the chain is invalid', () => {
        beforeEach(() => {
          incomingBlockchain.chain[2].hash = 'invalid-hash';
          blockchain.replaceChain(incomingBlockchain.chain);
        });

        it('does not replace the chain', () => {
          expect(blockchain.chain).toEqual(chainBeforeReplace);
        });

        it('logs an error', () => {
          expect(errorMock).toHaveBeenCalled();
        });
      });

      describe('and the chain is valid', () => {
        beforeEach(() => {
          blockchain.replaceChain(incomingBlockchain.chain);
        });

        it('replaces the chain', () => {
          expect(blockchain.chain).toEqual(incomingBlockchain.chain);
        });

        it('logs about chain replacement', () => {
          expect(logMock).toHaveBeenCalled();
        });
      });
    });
  });
});
