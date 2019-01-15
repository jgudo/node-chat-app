const socket = io();

(function($){
  $.deparam = $.deparam || function(uri){
    if(uri === undefined){
      uri = window.location.search;
    }
    var queryString = {};
    uri.replace(
      new RegExp(
        "([^?=&]+)(=([^&#]*))?", "g"),
        function($0, $1, $2, $3) {
        	queryString[$1] = decodeURIComponent($3.replace(/\+/g, '%20'));
        }
      );
      return queryString;
    };
})(jQuery);

function scrollToBottom() {
  const messages = $('#messages');
  const newMessage = messages.children('li:last-child');
  const clientHeight = messages.prop('clientHeight');
  const scrollTop = messages.prop('scrollTop');
  const scrollHeight = messages.prop('scrollHeight');
  const newMessageHeight = newMessage.innerHeight();
  const lastMessageHeight = newMessage.prev().innerHeight();

  if(clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
    messages.scrollTop(scrollHeight);
  }
}

socket.on('connect', () => {
  const params = $.deparam(window.location.search);

  socket.emit('join', params, (err) => {
    if(err) {
      alert(err);
      window.location.href = '/';
    } else {
      console.log('OK');
    }
  });

});

socket.on('disconnect', () => {
  console.log('Disconnected from the server');
});

socket.on('updateUserList', (users) => {
  const ul = $('<ul></ul>');

  users.forEach((user) => {
    ul.append($('<li></li>').text(user));
  });
  
  $('#users').html(ul);

  //console.log('Users list', users);
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
  scrollToBottom();
  socket.on('newLocationMessage', (message) => {
    const time = moment(message.createdAt).format('h:mm a');
    const template = $('#location-message-template').html();
    const html = Mustache.render(template, {
      from: message.from,
      url: message.url,
      createdAt: time
    });

    $('#messages').append(html);
    scrollToBottom();
  }); 
}); 

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