const expect = require('expect');
const {generateMessage, generateLocationMessage} = require('./message');


describe('generateMessage', () => {
  it('should generate correct message object', () => {
    const from = 'Gagu',
          text = 'Hehe',
          message = generateMessage(from,text);

    expect(typeof message.createdAt).toBe('number');
    expect(message).toMatchObject({from, text});
    
  });
});

describe('generateLocationMessage', () => {
  it('should generate location message', () => {
    const url = 'https://www.google.com/maps?q=1,2';
    const from = 'Ulul',
          lat = 1,
          lon = 2,
          result = generateLocationMessage(from, lat, lon);
    
    expect(result.url).toBe(url);
  });
});