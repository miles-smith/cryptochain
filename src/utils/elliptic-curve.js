const elliptic   = require('elliptic');
const cryptoHash = require('./crypto-hash');

const EC = elliptic.ec;

const ellipticCurve = new EC('secp256k1');

const verifySignature = ({ publicKey, data, signature }) => {
  const keyFromPublic = ellipticCurve.keyFromPublic(publicKey, 'hex');
  const hashedData    = cryptoHash(data);

  return keyFromPublic.verify(hashedData, signature);
}

module.exports = {
  ellipticCurve,
  verifySignature,
}
