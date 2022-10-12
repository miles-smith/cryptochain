const Blockchain = require('../src/blockchain');

const maxBlocks  = +(process.env.BLOCKS || 500);

const timings    = [];
const data       = [];

const blockchain = new Blockchain;

let previousTimestamp;
let nextTimestamp;
let lastBlock;
let nextBlock;
let timeDiff;
let averageTime;

blockchain.addBlock({ data: 'initial data' });

const startTime = Date.now();

for(let i = 1; i <= maxBlocks; i++) {
  lastBlock         = blockchain.lastBlock();
  previousTimestamp = lastBlock.timestamp;

  blockchain.addBlock({ data: `block-${i}` });

  nextBlock     = blockchain.lastBlock();
  nextTimestamp = nextBlock.timestamp;

  timeDiff = nextTimestamp - previousTimestamp;
  timings.push(timeDiff);

  averageTime = timings.reduce((accumulator, element) => (accumulator + element)) / timings.length;

  data.push({
    timeToMine:  timeDiff,
    difficulty:  nextBlock.difficulty,
    averageTime: averageTime,
  });

  process.stdout.write(`\rGathering data points... ${i}/${maxBlocks}`);
}

const endTime = Date.now();

process.stdout.write(`\nDone in ${(endTime - startTime) / 1000} seconds.\n`);

console.table(data);
