const cryptoHash = require('./crypto-hash');

describe('cryptoHash()', () => {
  it('generates a SHA256 hashed output', () => {
    const output = cryptoHash('test');
    const hash   = '4d967a30111bf29f0eba01c448b375c1629b2fed01cdfcc3aed91f1b57d5dd5e';

    expect(output).toEqual(hash);
  });

  it('produces the same hash irrespective of argument order', () => {
    const outputOne = cryptoHash('one', 'two', 'three');
    const outputTwo = cryptoHash('three', 'one', 'two');

    expect(outputOne).toEqual(outputTwo);
  });

  it('produces a unique hash for mutable objects', () => {
    const o = {};
    const originalHash = cryptoHash(o);

    o.mutation = 1;

    const newHash = cryptoHash(o);

    expect(newHash).not.toEqual(originalHash);
  });
});
