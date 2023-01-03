const Transaction                   = require('./transaction');
const { INITIAL_BALANCE }           = require('../../config');
const { ellipticCurve, cryptoHash } = require('../utils');

class Wallet {
  constructor() {
    this.balance   = INITIAL_BALANCE;
    this.keyPair   = ellipticCurve.genKeyPair();
    this.publicKey = this.keyPair.getPublic().encode('hex');
  }

  // TODO: This may be better served as a delegate method on an instance of `Wallet` rather than
  // a class method; all of the heavy lifting should be done by an instance of `Blockchain`.
  static calculateBalance({ wallet, blockchain }) {
    let accumulator    = 0;
    let hasTransaction = false;

    for(let i = blockchain.length() - 1; i > 0; i--) {
      const block = blockchain.fetchBlock(i);

      for(let transaction of block.data) {
        if(transaction.input.address === wallet.publicKey) {
          hasTransaction = true;
        }

        accumulator += transaction.output[wallet.publicKey] || 0;
      }

      if(hasTransaction)
        break;
    }

    return hasTransaction ? accumulator : INITIAL_BALANCE + accumulator;
  }

  sign(data) {
    const signature = this.keyPair.sign(cryptoHash(data));

    return signature.toDER('hex');
  }

  createTransaction({ recipient, amount, blockchain }) {
    if(blockchain) {
      this.balance = Wallet.calculateBalance({ wallet: this, blockchain });
    }

    if(this.balance < amount)
      throw new Error('Insufficient funds!');

    return new Transaction({ sender: this, recipient, amount });
  }
}

module.exports = Wallet;
