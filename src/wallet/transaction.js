const uuid = require('uuid/v1');
const { verifySignature } = require('../utils');

class Transaction {
  constructor({ sender, recipient, amount }) {
    this.id     = uuid();
    this.output = this._createOutput({ sender, recipient, amount });
    this.input  = this._createInput({ sender });
  }

  static validate(transaction) {
    const { input, output } = transaction;
    const { address, balance, signature } = input;

    const errorMessage = `Invalid transaction! ID: ${transaction.id}, address: ${address}`;

    const outputTotal = Object.values(output).reduce((acc, item) => acc + item);

    if(balance !== outputTotal) {
      console.error(errorMessage);
      return false;
    }

    if(!verifySignature({ publicKey: address, data: output, signature })) {
      console.error(errorMessage);
      return false;
    }

    return true;
  }

  update({ sender, recipient, amount }) {
    if(this.input.balance < amount)
      throw new Error('Insufficient funds!');

    // TODO: nullish assignment would be nice here...
    const oldRecipientAmount = this.output[recipient] || 0;
    const newRecipientAmount = oldRecipientAmount + amount;

    this.output[recipient] = newRecipientAmount;
    this.output[sender.publicKey] -= amount;

    this.input = this._createInput({ sender });
  }

  _createOutput({ sender, recipient, amount }) {
    return {
      [recipient]: amount,
      [sender.publicKey]: sender.balance - amount
    }
  }

  _createInput({ sender }) {
    return {
      timestamp: new Date(),
      address:   sender.publicKey,
      balance:   sender.balance,
      signature: sender.sign(this.output),
    };
  }
}

module.exports = Transaction;
