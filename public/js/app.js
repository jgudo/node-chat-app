const socket = io();

socket.on('connect', () => {
  console.log('Connected to server');

});

socket.on('disconnect', () => {
  console.log('Disconnected from the server');
});

socket.on('newMessage', (message) => {
  const time = moment(message.createdAt).format('h:mm a');
  const template = $('#message-template').html();
  const html = Mustache.render(template, {
    from: message.from,
    text: message.text,
    createdAt: time
  });

  $('#messages').append(html);
  // const time = moment(message.createdAt).format('h:mm a');
  // console.log(message);
  // let li = $('<li></li>');
  // li.text(`${message.from} ${time}: ${message.text} `);

  // $('#messages').append(li);

  socket.on('newLocationMessage', (message) => {
    const time = moment(message.createdAt).format('h:mm a');
    const template = $('#location-message-template').html();
    const html = Mustache.render(template, {
      from: message.from,
      url: message.url,
      createdAt: time
    });

    $('#messages').append(html);
    // const li = $('<li></li>');
    // const link = $('<a target="_blank">View Location</a>');

    // li.text(`From: ${message.from} ${time}`);
    // link.attr('href', message.url);

    // li.append(link);
    // $('#messages').append(li);

  }); 
}); 


// socket.emit('createMessage', {
//   from: 'Sira',
//   text: 'Hi'
// }, (data) => {
//   console.log('Got it ', data);
// });

$('#form').on('submit', (e) => {
  e.preventDefault();
  const input = $('[name="message"]');
  socket.emit('createMessage', {
    from: 'User',
    text: input.val()
  });

  input.val('');
});

const locationButton = $('#send-location');

locationButton.on('click', () => {
  if(!navigator.geolocation) {
    return alert('Geolocation not supported by your browser');
  }
  locationButton.attr('disabled', 'disabled').text('Sending Location...');

  navigator.geolocation.getCurrentPosition((pos) => {
    locationButton.removeAttr('disabled').text('Send Location');
    socket.emit('createLocationMessage', {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude
    });
  }, () => {
    locationButton.removeAttr('disabled').text('Send Location');
    alert('Unable to fetch location');
  });
});