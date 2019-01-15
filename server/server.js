const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const {generateMessage, generateLocationMessage} = require('./utils/message');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.emit('newMessage', generateMessage('Admin', 'Welcome to chat app'));
  socket.broadcast.emit('newMessage', generateMessage('Admin', 'New user joined'));
  
  socket.on('createLocationMessage', (coords) => {
    io.emit('newLocationMessage', generateLocationMessage('Admin', coords.latitude, coords.longitude));
  });

  socket.on('createMessage', (message, fn) => {
    io.emit('newMessage', generateMessage(message.from, message.text));
    //fn('This is from the server');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});


server.listen(port, () => {
  console.log('Server is running on port ', port);
});
