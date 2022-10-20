const MINE_RATE = 1000; // 1 second.
const INITIAL_DIFFICULTY = 3;

const GENESIS_DATA = {
  timestamp: 0,
  lastHash: '5bede78a01908ed9735367c1bfdfff294a2a891d38e3ce00659aa559111824d4',
  hash: 'b00bc4c44ee40e3852553495d9213a618aaef49932c9585847f6f18040597b90',
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
  data: [],
};

const INITIAL_BALANCE = 1000; // Give everyone a little start up currency.

module.exports = {
  GENESIS_DATA,
  MINE_RATE,
  INITIAL_BALANCE,
};
