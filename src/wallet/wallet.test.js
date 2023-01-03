const Wallet              = require('./wallet');
const Transaction         = require('./transaction');
const Blockchain          = require('../blockchain');
const { INITIAL_BALANCE } = require('../../config');
const { verifySignature } = require('../utils');

describe('Wallet', () => {
  let wallet;

  beforeEach(() => {
    wallet = new Wallet();
  });

  it('has a `balance`', () => {
    expect(wallet).toHaveProperty('balance', INITIAL_BALANCE);
  });

  it('has a `publicKey`', () => {
    expect(wallet).toHaveProperty('publicKey');
  });

  describe('signing data', () => {
    const data = 'test';

    it('verifies a valid signature', () => {
      const signature    = wallet.sign(data);
      const verification = verifySignature({ publicKey: wallet.publicKey, data, signature });

      expect(verification).toBe(true);
    });

    it('does not verify an invalid signature', () => {
      const otherWallet  = new Wallet();
      const signature    = otherWallet.sign(data);
      const verification = verifySignature({ publicKey: wallet.publicKey, data, signature });

      expect(verification).toBe(false);
    });
  });

  describe('createTransaction()', () => {
    let recipient = 'test-recipient';

    describe('and the amount exceeds the balance', () => {
      it('throws an error', () => {
        const amount = wallet.balance + 1;

        expect(() => wallet.createTransaction({ recipient , amount }))
          .toThrow('Insufficient funds!');
      });
    })

    describe('and there is sufficient balance', () => {
      let transaction;
      let amount;

      beforeEach(() => {
        amount      = wallet.balance - 1;
        transaction = wallet.createTransaction({ recipient, amount });
      });

      it('creates a `Transaction`', () => {
        expect(transaction).toBeInstanceOf(Transaction);
      });

      it('matches the transaction input with the wallet', () => {
        expect(transaction.input.address).toEqual(wallet.publicKey);
      });

      it('oututs the amount to the recipient', () => {
        expect(transaction.output[recipient]).toEqual(amount);
      });
    });

    describe('and a chain is passed', () => {
      it('calls Wallet.calculateBalance', () => {
        const blockchain = new Blockchain();

        const originalFunction = Wallet.calculateBalance;
        const stubbedFunction  = jest.fn();

        Wallet.calculateBalance = stubbedFunction;

        wallet.createTransaction({ 
          recipient: 'test-recipient',
          amount: 10,
          blockchain: blockchain,
        });

        expect(stubbedFunction).toHaveBeenCalled();

        Wallet.calculateBalance = originalFunction;
      });
    });
  });

  describe('calculateBalance()', () => {
    let blockchain;

    beforeEach(() => {
      blockchain = new Blockchain();
    });

    describe('and there are no outputs for the wallet', () => {
      it('returns the `INITIAL_BALANCE`', () => {
        const actualBalance   = Wallet.calculateBalance({ wallet, blockchain });
        const expectedBalance = INITIAL_BALANCE;

        expect(actualBalance).toEqual(expectedBalance);
      });
    });

    describe('and there are outputs for the wallet', () => {
      let walletOne;
      let walletTwo;
      let transactionOne;
      let transactionTwo;

      beforeEach(() => {
        walletOne = new Wallet();
        walletTwo = new Wallet();

        transactionOne = walletOne.createTransaction({ recipient: wallet.publicKey, amount: 10 });
        transactionTwo = walletTwo.createTransaction({ recipient: wallet.publicKey, amount: 20 });

        blockchain.addBlock({ data: [transactionOne, transactionTwo] });
      });

      it('adds the sum of all outputs to the wallet balance', () => {
        const actualBalance   = Wallet.calculateBalance({ wallet, blockchain });
        const expectedBalance = 
            INITIAL_BALANCE + 
            transactionOne.output[wallet.publicKey] +
            transactionTwo.output[wallet.publicKey];
        
        expect(actualBalance).toEqual(expectedBalance);
      });
    });

    describe('and the wallet has made a transaction', () => {
      const amount = 10;
      let transaction;


      beforeEach(() => {
        transaction = wallet.createTransaction({ recipient: 'test-recipient', amount });

        blockchain.addBlock({ data: [transaction] });
      });

      it('returns the output amout of the most recent transaction', () => {
        const actualBalance   = Wallet.calculateBalance({ wallet, blockchain });
        const expectedBalance = transaction.output[wallet.publicKey];

        expect(actualBalance).toEqual(expectedBalance);
      });

      describe('and there are outputs within the same block, and in subsequent blocks', () => {
        let sameBlockTransaction;
        let nextBlockTransaction;

        beforeEach(() => {
          const otherWallet = new Wallet();

          transaction = wallet.createTransaction({ 
            recipient: 'test-recipient',
            amount: 1
          });

          sameBlockTransaction = Transaction.rewardTransaction({ wallet });
          
          nextBlockTransaction = otherWallet.createTransaction({ 
            recipient: wallet.publicKey, 
            amount: 2
          })

          blockchain.addBlock({ data: [transaction, sameBlockTransaction] });
          blockchain.addBlock({ data: [nextBlockTransaction] });
        });

        it('includes the amounts in the returned balance', () => {
          const actualBalance   = Wallet.calculateBalance({ wallet, blockchain });
          const expectedBalance = 
            transaction.output[wallet.publicKey] +
            sameBlockTransaction.output[wallet.publicKey] +
            nextBlockTransaction.output[wallet.publicKey];

          expect(actualBalance).toEqual(expectedBalance);
        });
      });
    });
  });
});
