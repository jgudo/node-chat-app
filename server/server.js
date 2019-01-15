const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {User} = require('./utils/users');


const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const user = new User();

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('join', (params, callback) => {
    if(!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Name and Room Name are required.');
    }

    socket.join(params.room);
    user.removeUser(socket.id);
    user.addUser(socket.id, params.name, params.room);

    io.to(params.room).emit('updateUserList', user.getUserList(params.room));

    socket.emit('newMessage', generateMessage('Admin', 'Welcome to chat app'));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined`));

  });

  socket.on('createLocationMessage', (coords) => {
    io.emit('newLocationMessage', generateLocationMessage('Admin', coords.latitude, coords.longitude));
  });

  socket.on('createMessage', (message, fn) => {
    io.emit('newMessage', generateMessage(message.from, message.text));
    //fn('This is from the server');
  });

  socket.on('disconnect', () => {
    const activeUser = user.removeUser(socket.id);

    if(activeUser) {
      io.to(activeUser.room).emit('updateUserList', user.getUserList(activeUser.room));
      io.to(activeUser.room).emit('newMessage', generateMessage('Admin:', `${activeUser.name} has left the chatroom`));
    }
    console.log('Client disconnected');
  });
});


server.listen(port, () => {
  console.log('Server is running on port ', port);
});
