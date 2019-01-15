const expect = require('expect');
const {isRealString} = require('./validation');

describe('Check params', () => {
  it('should reject non-string values', () => {
    const string = isRealString(977);
    expect(string).toBe(false);
  });

  it('should reject string with spaces only values', () => {
    const string = isRealString('   ');
    expect(string).toBe(false);
  }); 

  it('should allow string with non-space values', () => {
    const string = isRealString('Gagu');
    expect(string).toBe(true);
  });
});

