// Setup basic express server
const express = require('express'),
http = require('http'),
app = express(),
      
server = http.createServer(app),
io = require('socket.io').listen(server);
var server_port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    server_ip_address   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

app.get('/', (req, res) => {

res.send('Chat Server is running on port 3000')
});

// Chatroom

var numUsers = 0;

io.on('connection', (socket) => {
      console.log('user connected')
      var addedUser = false;

  // when the client emits 'new message', this listens and executes
socket.on('new message', (data) => {
      
      // we tell the client to execute 'new message'
      io.emit('new message', {   
      username: socket.username,
      message: data
      })
})
socket.on('playcontrol', function(mediaplaycontrol) {
    
      console.log( ' Video Play'+mediaplaycontrol)
    
      socket.broadcast.emit("mediacontrol",mediaplaycontrol) 

})

      // when the client emits 'add user', this listens and executes
socket.on('add user', (username) => {
      if (addedUser) return;

    // we store the username in the socket session for this client
      socket.username = username;
      ++numUsers;
      addedUser = true;
      socket.emit('login', {
            numUsers: numUsers
      })
    // echo globally (all clients) that a person has connected
      socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
      })
})

  // when the client emits 'typing', we broadcast it to others
socket.on('typing', () => {
      socket.broadcast.emit('typing', {
      username: socket.username
    })
})

  // when the client emits 'stop typing', we broadcast it to others
socket.on('stop typing', () => {
      socket.broadcast.emit('stop typing', {
      username: socket.username
    })
})

  // when the user disconnects.. perform this
socket.on('disconnect', () => {
      if (addedUser) {
        --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
      username: socket.username,
      numUsers: numUsers
      })
    }
})

})
      
  server.listen(server_port, server_ip_address,()=>{
  console.log( "Listening on " + server_ip_address + ", server_port " + server_port  )

})
