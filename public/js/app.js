const socket = io();

socket.on('connect', () => {
  console.log('Connected to server');

});

socket.on('disconnect', () => {
  console.log('Disconnected from the server');
});

socket.on('newMessage', (message) => {
  console.log(message);
  let li = $('<li></li>');
  li.text(`${message.from}: ${message.text}`);

  $('#messages').append(li);
}); 

socket.emit('createMessage', {
  from: 'Sira',
  text: 'Hi'
}, function(data) {
  console.log('Got it ', data);
});

$('#form').on('submit', function(e) {
  e.preventDefault();

  socket.emit('createMessage', {
    from: 'User',
    text: $('[name="message"]').val()
  });
});