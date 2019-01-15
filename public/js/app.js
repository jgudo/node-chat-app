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

  socket.on('newLocationMessage', (message) => {
    const li = $('<li></li>');
    const link = $('<a target="_blank">View Location</a>');

    li.text(`From: ${message.from}`);
    link.attr('href', message.url);

    li.append(link);
    $('#messages').append(li);

  }); 
}); 


socket.emit('createMessage', {
  from: 'Sira',
  text: 'Hi'
}, (data) => {
  console.log('Got it ', data);
});

$('#form').on('submit', (e) => {
  e.preventDefault();

  socket.emit('createMessage', {
    from: 'User',
    text: $('[name="message"]').val()
  });
});

const locationButton = $('#send-location');

locationButton.on('click', () => {
  if(!navigator.geolocation) {
    return alert('Geolocation not supported by your browser');
  }

  navigator.geolocation.getCurrentPosition((pos) => {
    socket.emit('createLocationMessage', {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude
    });
  }, () => {
    alert('Unable to fetch location');
  });
});