const expect = require('expect');
const {generateMessage} = require('./message');


describe('generateMessage', () => {
  it('should generate correct message object', () => {
    const from = 'Gagu',
          text = 'Hehe',
          message = generateMessage(from,text);

    expect(typeof message.createdAt).toBe('number');
    expect(message).toMatchObject({from, text});
    
  });
});