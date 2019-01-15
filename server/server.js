const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const {generateMessage} = require('./utils/message');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.emit('newMessage', generateMessage('Admin', 'Welcome to chat app'));
  socket.broadcast.emit('newMessage', generateMessage('Admin', 'New user joined'));
  
  socket.on('createMessage', (message, fn) => {
    console.log('New Message ', message);  
    io.emit('newMessage', generateMessage(message.from, message.text));
    //fn('This is from the server');

  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  // socket.emit('newMessage', {
  //   from: 'jane@doe.com',
  //   text: 'hoy',
  //   createdAt: 3643
  // });

  // socket.on('createEmail', (newEmail) => {
  //   console.log('Created new email ', newEmail);
  // });

  // socket.emit('newEmail', {
  //   from: 'gago@gmail.com',
  //   text: 'Sira ulo ka',
  //   createdAt: 1245
  // });
});


server.listen(port, () => {
  console.log('Server is running on port ', port);
});
