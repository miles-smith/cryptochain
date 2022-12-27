const redis = require('redis');

const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN:  'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION',
};

class PubSub {
  constructor({ blockchain, transactionPool }) {
    this.blockchain      = blockchain;
    this.transactionPool = transactionPool;

    this.publisher  = redis.createClient();
    this.subscriber = redis.createClient();

    this.subscriber.subscribe(CHANNELS.TEST);
    this.subscriber.subscribe(CHANNELS.BLOCKCHAIN);
    this.subscriber.subscribe(CHANNELS.TRANSACTION);

    this.subscriber.on('message', (channel, message) => {
      this._handleMessage({ channel, message });
    });
  }

  publish({ channel, message }) {
    this.subscriber.unsubscribe(channel, () => {
      this.publisher.publish(channel, message, () => {
        this.subscriber.subscribe(channel);
      });
    });
  }

  broadcastChain() {
    const message = JSON.stringify(this.blockchain.chain);

    this._logMessage({
      channel: CHANNELS.BLOCKCHAIN,
      message: message,
      action:  'PUBLISHED',
    });

    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: message,
    });
  }

  broadcastTransaction(transaction) {
    const message = JSON.stringify(transaction);

    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: message,
    });
  }

  _handleMessage({ channel, message }) {
    const parsedMessage = JSON.parse(message);

    this._logMessage({
      channel: channel,
      message: message,
      action:  'RECEIVED'
    });

    switch(channel) {
      case CHANNELS.BLOCKCHAIN:
        this.blockchain.replaceChain(parsedMessage, () => {
          this.transactionPool.clearBlockchainTransactions({ chain: parsedMessage });
        });

        break;
      case CHANNELS.TRANSACTION:
        this.transactionPool.setTransaction(parsedMessage);
        break;
      default:
        break;
    }
  }

  _logMessage({ channel, message, action }) {
    const timestamp = new Date();
    let tags = [
      timestamp.toISOString(),
      channel,
      action,
    ];

    tags = tags.map((tag) => `[${tag}]`);

    console.log(tags.join(''), message);
  }
}

module.exports = PubSub;
