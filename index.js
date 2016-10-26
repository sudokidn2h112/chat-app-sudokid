var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var bodyParser = require('body-parser')

var port = process.env.PORT || 3000;
var connections = [];

app.use(express.static('./public'));
app.set('view engine', 'ejs');
app.set('views', './views');


var arrUsersOnline = [];

//Connect socketio
io.sockets.on('connection', function(socket){
    connections.push(socket);
    console.log("Connected: %s sockets connected ", connections.length);
    socket.on('client-send-username', function (data) {
    console.log('have signup with username: '+data);
    if(arrUsersOnline.indexOf(data) >=0){
      socket.emit('server-send-error', data);
    }else {
      arrUsersOnline.push(data);
      socket.username = data;
      socket.emit('server-send-user-and-hide-signup')
      io.sockets.emit('server-send-success', {id:socket.id, username: data});
    }
  })
  socket.on('client-send-message', function (data) {
    io.sockets.emit('server-send-message', {username: socket.username, msg: data});
  });
  socket.on('client-to-client', function (data) {
    io.to(data).emit('server-send-client', {username: socket.username});
  });

  //Disconnect socketio
    socket.on("disconnect", function(data){
      arrUsersOnline.splice(arrUsersOnline.indexOf(socket.id), 1);
      updateUsernames();
      connections.splice(connections.indexOf(socket), 1);
      console.log("Disconnected: %s sockets connected", connections.length);
    });
  //function update UserOnline
  function updateUsernames() {
    io.sockets.emit('get-user', { arrUsersOnline, userLeave: socket.username,message: "User " + socket.username + " just leave" , id: socket.id});
  }
});

app.get('/', function (req, res) {
  res.render('chat');
});

server.listen(port, function (err) {
  if(err){
    console.log('Server start error: '+err);
  }else {
    console.log('Server is running at port: '+port);
  }
})
