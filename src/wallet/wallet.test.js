const Wallet = require('./wallet');
const { INITIAL_BALANCE } = require('../../config');
const { verifySignature } = require('../utils');

describe('Wallet', () => {
  let wallet;

  beforeEach(() => {
    wallet = new Wallet();
  });

  it('has a `balance`', () => {
    expect(wallet).toHaveProperty('balance', INITIAL_BALANCE);
  });

  it('has a `publicKey`', () => {
    expect(wallet).toHaveProperty('publicKey');
  });

  describe('signing data', () => {
    const data = 'test';

    it('verifies a valid signature', () => {
      const signature    = wallet.sign(data);
      const verification = verifySignature({ publicKey: wallet.publicKey, data, signature });

      expect(verification).toBe(true);
    });

    it('does not verify an invalid signature', () => {
      const otherWallet  = new Wallet();
      const signature    = otherWallet.sign(data);
      const verification = verifySignature({ publicKey: wallet.publicKey, data, signature });

      expect(verification).toBe(false);
    });
  });
});
