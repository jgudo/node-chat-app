import io from 'socket.io-client';
import Mustache from 'mustache';
import WebFont from 'webfontloader';
import moment from 'moment';
import './styles/style.scss';

WebFont.load({
  google: {
    families: ['Mukta']
  }
});

if(document.body.getAttribute('data-id') === 'welcome'){
  const joinForm = document.getElementById('join');
  const inputFile = document.getElementById('file');
  const previewContainer = document.querySelector('.preview');
  let file = null;

  inputFile.addEventListener('change', () => {
    file = inputFile.files[0];
    const url = URL.createObjectURL(file);
    console.log(url);
    previewContainer.innerHTML = '';
    const img = new Image();
    img.setAttribute('src', url);

    previewContainer.appendChild(img);
  });

}

if(document.body.getAttribute('data-id') === 'chat') {
  const socket = io();

  function deparam(url){
    var qs = url.substring(url.indexOf('?') + 1).split('&');
    for(var i = 0, result = {}; i < qs.length; i++){
        qs[i] = qs[i].split('=');
        result[qs[i][0]] = decodeURIComponent(qs[i][1]);
    }
    return result;
  }

  function getRectangle(obj) {
    var r = { top: 0, left: 0, width: 0, height: 0 };

    if(!obj)
      return r;

    else if(typeof obj == "string")
      obj = document.getElementById(obj);

    if(typeof obj != "object")
      return r;

    if(typeof obj.offsetTop != "undefined") {

      r.height = parseInt(obj.offsetHeight);
      r.width  = parseInt(obj.offsetWidth);
      r.left = r.top = 0;

      while(obj && obj.tagName != "BODY") {

          r.top  += parseInt(obj.offsetTop);
          r.left += parseInt(obj.offsetLeft);

          obj = obj.offsetParent;
      }
    }
    return r;
  }

  function scrollToBottom() {
    const messages = document.getElementById('messages');
    const newMessage = messages.lastElementChild;
    const clientHeight = messages.clientHeight;
    const scrollTop = messages.scrollTop;
    const scrollHeight = messages.scrollHeight;
    const newMessageHeight = getRectangle(newMessage).height;
    const lastMessageHeight = getRectangle(newMessage.previousElementSibling).height;

    if(clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
      messages.scrollTop = scrollHeight;
    }
  }

  socket.on('connect', () => {
    const params = deparam(window.location.search);
    console.log(params);
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
    const ul = document.createElement('ul');
    const li = document.createElement('li');
    
    let template = '';
    users.forEach((user) => {
      template += `<li>${user}</li>`;
    });
    const html = `<ul>${template}</ul>`;
    document.getElementById('users').innerHTML = html;

    //console.log('Users list', users);
  });

  socket.on('newMessage', (message) => {
    const time = moment(message.createdAt).format('h:mm a');
    const template = document.getElementById('message-template').innerHTML;
    const html = Mustache.render(template, {
      from: message.from,
      text: message.text,
      createdAt: time
    });

    document.getElementById('messages').insertAdjacentHTML('beforeend', html);

    scrollToBottom();
    socket.on('newLocationMessage', (message) => {
      const time = moment(message.createdAt).format('h:mm a');
      const template = document.getElementById('location-message-template').innerHTML;
      const html = Mustache.render(template, {
        from: message.from,
        url: message.url,
        createdAt: time
      });

      document.getElementById('messages').insertAdjacentHTML('beforeend', html);
      scrollToBottom();
    }); 
  }); 

  document.getElementById('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.querySelector('input[name="message"]');
    socket.emit('createMessage', {
      text: input.value
    });

    input.value = '';
  });

  const locationButton = document.getElementById('send-location');

  locationButton.addEventListener('click', () => {
    if(!navigator.geolocation) {
      return alert('Geolocation not supported by your browser');
    }
    locationButton.disabled = true;
    locationButton.textContent = 'Sending Location...';

    navigator.geolocation.getCurrentPosition((pos) => {
      locationButton.disabled = false;
      locationButton.textContent = 'Send Location';
      socket.emit('createLocationMessage', {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude
      });
    }, () => {
      locationButton.disabled = false;
      locationButton.textContent = 'Send Location';
      alert('Unable to fetch location');
    });
  });
}