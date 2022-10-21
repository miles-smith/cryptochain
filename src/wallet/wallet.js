const Transaction                   = require('./transaction');
const { INITIAL_BALANCE }           = require('../../config');
const { ellipticCurve, cryptoHash } = require('../utils');

class Wallet {
  constructor() {
    this.balance   = INITIAL_BALANCE;
    this.keyPair   = ellipticCurve.genKeyPair();
    this.publicKey = this.keyPair.getPublic().encode('hex');
  }

  sign(data) {
    const signature = this.keyPair.sign(cryptoHash(data));

    return signature.toDER('hex');
  }

  createTransaction({ recipient, amount }) {
    if(this.balance < amount)
      throw new Error('Insufficient funds!');

    return new Transaction({ sender: this, recipient, amount });
  }
}

module.exports = Wallet;
