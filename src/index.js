const express         = require('express');
const request         = require('request');
const Blockchain      = require('./blockchain');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet          = require('./wallet/wallet');
const PubSub          = require('./pubsub');
const Miner           = require('./miner');

const DEFAULT_PORT      = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

const app             = express();
const port            = process.env.PORT || DEFAULT_PORT;
const blockchain      = new Blockchain();
const transactionPool = new TransactionPool();
const wallet          = new Wallet();
const pubsub          = new PubSub({ blockchain, transactionPool });
const miner           = new Miner({ blockchain, transactionPool, wallet, pubsub });

app.use(express.json());

app.get('/api/v1/blocks', (req, res) => {
  res.json(blockchain.chain);
});

app.post('/api/v1/blocks', (req, res) => {
  const { data } = req.body.block;

  if(data) {
    blockchain.addBlock({ data });
    pubsub.broadcastChain(blockchain.chain);

    res
      .status(201)
      .json(blockchain.chain);
  } else {
    res
      .status(422)
      .end();
  }
});

app.get('/api/v1/transactions', (req, res) => {
  res
    .status(200)
    .json({ transactions: transactionPool.transactions });
});

app.post('/api/v1/transactions', (req, res) => {
  const { recipient, amount } = req.body.transaction;
  let transaction = transactionPool.findBySender({ sender: wallet.publicKey });

  // TODO: Refactor and follow RESTful routing.
  try {
    if(transaction) {
      transaction.update({ sender: wallet, recipient, amount });
    } else {
      transaction = wallet.createTransaction({ recipient, amount, blockchain });
    }
  } catch(error) {
      res
        .status(422)
        .json({ error: { message: error.message } });

      return;
  }

  transactionPool.setTransaction(transaction);
  pubsub.broadcastTransaction(transaction);

  res
    .status(200)
    .json({ transaction });
});

app.post('/api/v1/transactions/mine', (req, res) => {
  miner.mineTransactions();

  res.redirect('/api/v1/blocks');
});

app.get('/api/v1/wallet', (req, res) => {
  res.json({
    address: wallet.publicKey,
    balance: Wallet.calculateBalance({ wallet, blockchain }),
  });
});

const syncWithRoot = () => {
  request({ url: `${ROOT_NODE_ADDRESS}/api/v1/blocks` }, (error, response, body) => {
    if(!error && response.statusCode === 200) {
      const rootChain = JSON.parse(body);

      blockchain.replaceChain(rootChain);
    }
  });

  request({ url: `${ROOT_NODE_ADDRESS}/api/v1/transactions` }, (error, response, body) => {
    if(!error && response.statusCode === 200) {
      const { transactions } = JSON.parse(body);

      transactionPool.rehydrate(transactions);
    }
  });
};

app.listen(port, () => {
  console.log('Listening on port', port);

  if(port !== DEFAULT_PORT) {
    syncWithRoot();
  }
});
