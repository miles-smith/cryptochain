const express    = require('express');
const request    = require('request');
const Blockchain = require('./blockchain');
const PubSub     = require('./pubsub');

const app        = express();
const port       = process.env.PORT || 3000;
const blockchain = new Blockchain();
const pubsub     = new PubSub({ blockchain });

const ROOT_NODE_ADDRESS = 'http://localhost:3000';

setTimeout(() => { pubsub.broadcastChain() }, 1000);

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
  syncChain();
});
