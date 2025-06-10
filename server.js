const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = 3000;

app.use(express.static('public'));

let onlineUsers = {};

io.on('connection', (socket) => {
  console.log('A user connected: ' + socket.id);

  // New user joins with a username
  socket.on('new-user', (username) => {
    onlineUsers[socket.id] = username;
    io.emit('user-list', Object.values(onlineUsers));
    io.emit('user-joined', username + ' joined the chat');
  });

  // Broadcast chat message
  socket.on('chat-message', (msg) => {
    io.emit('chat-message', { username: onlineUsers[socket.id], message: msg });
  });

  // Typing indicator
  socket.on('typing', () => {
    socket.broadcast.emit('typing', onlineUsers[socket.id]);
  });

  socket.on('stop-typing', () => {
    socket.broadcast.emit('stop-typing', onlineUsers[socket.id]);
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (onlineUsers[socket.id]) {
      io.emit('user-left', onlineUsers[socket.id] + ' left the chat');
      delete onlineUsers[socket.id];
      io.emit('user-list', Object.values(onlineUsers));
    }
    console.log('User disconnected: ' + socket.id);
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
