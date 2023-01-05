const { cryptoHash } = require('../utils');
const Blockchain     = require('./blockchain');
const Block          = require('./block');
const Wallet         = require('../wallet/wallet');
const Transaction    = require('../wallet/transaction');

describe('Blockchain', () => {
  let blockchain;
  let errorMock;
  let logMock;

  beforeEach(() => {
    blockchain = new Blockchain();
    errorMock  = jest.fn();
    logMock    = jest.fn();
    
    global.console.error = errorMock;
    global.console.log   = logMock;
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
    let wallet;
    let transactionOne;
    let transactionTwo;
    let incomingBlockchain;
    let chainBeforeReplace;

    beforeEach(() => {
      wallet             = new Wallet();
      transactionOne     = wallet.createTransaction({ recipient: 'test-recipient', amount: 1 });
      transactionTwo     = wallet.createTransaction({ recipient: 'test-recipient', amount: 2 });
      incomingBlockchain = new Blockchain();
      chainBeforeReplace = blockchain.chain;
    });

    describe('when the new chain is not longer', () => {
      beforeEach(() => { 
        blockchain.addBlock({ data: [transactionOne] });
        incomingBlockchain.addBlock({ data: [transactionTwo] });

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
        incomingBlockchain.addBlock({ data: [transactionOne] });
        incomingBlockchain.addBlock({ data: [transactionTwo] });
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

  describe('validTransactionData()', () => {
    let incomingBlockchain;
    let wallet;
    let userTransaction;
    let rewardTransaction;

    beforeEach(() => {
      incomingBlockchain = new Blockchain();
      wallet             = new Wallet();
      userTransaction    = wallet.createTransaction({ recipient: 'test-recipient', amount: 10 });
      rewardTransaction  = Transaction.rewardTransaction({ wallet });
    });

    describe('and the transaction data is valid', () => {
      it('returns true', () => {
        incomingBlockchain.addBlock({ data: [userTransaction, rewardTransaction] });

        const valid = blockchain.validTransactionData(incomingBlockchain.chain);

        expect(valid).toBe(true);
      });

      it('does not log an error', () => {
        incomingBlockchain.addBlock({ data: [userTransaction, rewardTransaction] });

        blockchain.validTransactionData(incomingBlockchain.chain);

        expect(errorMock).not.toHaveBeenCalled();
      });
    });

    describe('and the transaction data is invalid', () => {
      describe('when the transaction data includes multiple rewards', () => {
        it('returns false', () => {
          incomingBlockchain.addBlock({ 
            data: [
              userTransaction,
              rewardTransaction,
              rewardTransaction,
            ]
          });

          const valid = blockchain.validTransactionData(incomingBlockchain.chain);

          expect(valid).toBe(false);
        });

        it('logs an error', () => {
          incomingBlockchain.addBlock({
            data: [
              userTransaction,
              rewardTransaction,
              rewardTransaction
            ]
          });

          blockchain.validTransactionData(incomingBlockchain.chain);

          expect(errorMock).toHaveBeenCalled();
        });
      });

      describe('when the transaction data has malformed output', () => {
        describe('and the transaction is not a reward transaction', () => {
          it('returns false', () => {
            userTransaction.output[wallet.publicKey] = wallet.balance * 2;

            incomingBlockchain.addBlock({ data: [userTransaction, rewardTransaction] });

            const valid = blockchain.validTransactionData(incomingBlockchain.chain);

            expect(valid).toBe(false);
          });

          it('logs an error', () => {
            userTransaction.output[wallet.publicKey] = wallet.balance * 2;

            incomingBlockchain.addBlock({ data: [userTransaction, rewardTransaction] });

            blockchain.validTransactionData(incomingBlockchain.chain);

            expect(errorMock).toHaveBeenCalled();
          });
        });

        describe('and the transaction is a reward transaction', () => {
          it('returns false', () => {
            rewardTransaction.output[wallet.publicKey] = 999999;
            
            incomingBlockchain.addBlock({ data: [userTransaction, rewardTransaction] });

            const valid = blockchain.validTransactionData(incomingBlockchain.chain);

            expect(valid).toBe(false);
          });

          it('logs an error', () => {
            rewardTransaction.output[wallet.publicKey] = 999999;

            incomingBlockchain.addBlock({ data: [userTransaction, rewardTransaction] });

            blockchain.validTransactionData(incomingBlockchain.chain);

            expect(errorMock).toHaveBeenCalled();
          });
        });
      });

      describe('when the transaction has malformed input', () => {
        it('returns false', () => {
          wallet.balance = 999999;

          const amount = 1000;
         
          const malformedOutput = {
            'test-recipient': amount,
            [wallet.publicKey]: wallet.balance - amount,
          };

          const badTransaction = {
            input: {
              timestamp: Date.now(),
              address:   wallet.publicKey,
              balance:   wallet.balance,
              signature: wallet.sign(malformedOutput),
            },
            output: malformedOutput,
          };

          incomingBlockchain.addBlock({ data: [badTransaction, rewardTransaction] });

          const valid = blockchain.validTransactionData(incomingBlockchain.chain);

          expect(valid).toBe(false);
        });

        it('logs an error', () => {
          wallet.balance = 999999;

          const amount = 1000;

          const malformedOutput = {
            'test-recipient': amount,
            [wallet.publicKey]: wallet.balance - amount,
          };

          const badTransaction = {
            input: {
              timestamp: Date.now(),
              address:   wallet.publicKey,
              balance:   wallet.balance,
              signature: wallet.sign(malformedOutput),
            },
            output: malformedOutput,
          };

          incomingBlockchain.addBlock({ data: [badTransaction, rewardTransaction] });

          blockchain.validTransactionData(incomingBlockchain.chain);

          expect(errorMock).toHaveBeenCalled();
        });
      });

      describe('when the block contains duplicate transactions', () => {
        it('returns false', () => {
          incomingBlockchain.addBlock({
            data: [
              userTransaction,
              userTransaction,
              rewardTransaction
            ]
          });

          const valid = blockchain.validTransactionData(incomingBlockchain.chain);

          expect(valid).toBe(false);
        });

        it('logs an error', () => {
          incomingBlockchain.addBlock({
            data: [
              userTransaction,
              userTransaction,
              rewardTransaction
            ]
          });

          blockchain.validTransactionData(incomingBlockchain.chain);

          expect(errorMock).toHaveBeenCalled();
        });
      });
    });
  });
});
