const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {User} = require('./utils/users');


const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const user = new User();

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.static(publicPath));


io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('join', (params, callback) => {
    if(!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Name and Room Name are required.');
    }

    socket.join(params.room);
    user.removeUser(socket.id);
    user.addUser(socket.id, params.name, params.room, params.avatar);

    io.to(params.room).emit('updateUserList', user.getUserList(params.room));

    socket.emit('newMessage', generateMessage('Admin', 'Welcome to chat app'));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined`));

  });

  socket.on('createLocationMessage', (coords) => {
    const activeUser = user.getUser(socket.id);
    if(user){
      io.to(activeUser.room).emit('newLocationMessage', generateLocationMessage(activeUser.name, coords.latitude, coords.longitude));
    }
  });

  socket.on('createMessage', (message, fn) => {
    const activeUser = user.getUser(socket.id);

    if(user && isRealString(message.text)) {
      io.to(activeUser.room).emit('newMessage', generateMessage(activeUser.name, message.text));
    }

   
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
