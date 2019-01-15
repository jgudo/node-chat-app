const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('createMessage', (message) => {
    console.log('New Message ', message);

    socket.emit('newMessage', {
      from: 'Admin',
      text: 'Welcome to chat app'
    });

    socket.broadcast.emit('newMessage', {
      from: 'Admin',
      text: 'New user joined',
      createdAt: new Date()
    });
    // io.emit('newMessage', {
    //   from: message.from,
    //   text: message.text
    // });

    // socket.broadcast.emit('newMessage', {
    //   from: message.from,
    //   text: message.text,
    //   createdAt: new Date()
    // });
  }); 

  socket.emit('newMessage', {
    from: 'jane@doe.com',
    text: 'hoy',
    createdAt: 3643
  });

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
