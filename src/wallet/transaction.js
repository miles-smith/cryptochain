const uuid = require('uuid/v1');
const { verifySignature } = require('../utils');
const { REWARD_INPUT, MINING_REWARD } = require('../../config.js');

// TODO: Consider OO principles and break apart this class into a heirarchy with seperate classes
// for the different types of transaction (general, mining reward etc.) rather than stuffing
// everything into this single class and overriding/bypassing behaviour and expectations based
// upon instantiaton args.
class Transaction {
  constructor({ sender, recipient, amount, input, output }) {
    this.id     = uuid();
    this.output = output || this._createOutput({ sender, recipient, amount });
    this.input  = input  || this._createInput({ sender });
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

  static rewardTransaction({ wallet }) {
    return new this({ 
      input: REWARD_INPUT,
      output: { [wallet.publicKey]: MINING_REWARD },
    });
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
