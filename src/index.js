const express         = require('express');
const request         = require('request');
const Blockchain      = require('./blockchain');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet          = require('./wallet/wallet');
const PubSub          = require('./pubsub');

const DEFAULT_PORT      = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

const app             = express();
const port            = process.env.PORT || DEFAULT_PORT;
const blockchain      = new Blockchain();
const transactionPool = new TransactionPool();
const wallet          = new Wallet();
const pubsub          = new PubSub({ blockchain });


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

app.post('/api/v1/transactions', (req, res) => {
  const { recipient, amount } = req.body.transaction;
  let transaction = transactionPool.findBySender({ sender: wallet.publicKey });

  // TODO: Refactor and follow RESTful routing.
  try {
    if(transaction) {
      transaction.update({ sender: wallet, recipient, amount });
    } else {
      transaction = wallet.createTransaction({ recipient, amount });
    }
  } catch(error) {
      res
        .status(422)
        .json({ error: { message: error.message } });

      return;
  }

  transactionPool.setTransaction(transaction);

  res
    .status(200)
    .json({ transaction });
});

const syncChain = () => {
  request({ url: `${ROOT_NODE_ADDRESS}/api/v1/blocks` }, (error, response, body) => {
    if(!error && response.statusCode === 200) {
      const rootChain = JSON.parse(body);

      blockchain.replaceChain(rootChain);
    }
  });
};

app.listen(port, () => {
  console.log('Listening on port', port);

  if(port !== DEFAULT_PORT) {
    syncChain();
  }
});
