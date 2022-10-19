const express    = require('express');
const Blockchain = require('./blockchain');
const PubSub     = require('./pubsub');

const app        = express();
const port       = process.env.PORT || 3000;
const blockchain = new Blockchain();
const pubsub     = new PubSub({ blockchain });

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

app.listen(port, () => {
  console.log('Listening on port', port);
});
