const cryptoHash = require('./crypto-hash');

describe('cryptoHash()', () => {
  it('generates a SHA256 hashed output', () => {
    const output = cryptoHash('test');
    const hash   = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08';

    expect(output).toEqual(hash);
  });

  it('produces the same hash irrespective of argument order', () => {
    const outputOne = cryptoHash('one', 'two', 'three');
    const outputTwo = cryptoHash('three', 'one', 'two');

    expect(outputOne).toEqual(outputTwo);
  });
});
