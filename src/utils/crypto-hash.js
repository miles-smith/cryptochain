const crypto = require('crypto');

const cryptoHash = (...inputs) => {
  const hash = crypto.createHash('sha256');
  const str  =
    inputs
      .sort()
      .join(' ');

  hash.update(str);

  return hash.digest('hex');
};

module.exports = cryptoHash
