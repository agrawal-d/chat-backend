var createError = require('http-errors');
var express = require('express');
var http = require('http');
var io = require('socket.io');
const fq = require("fuzzquire");
var app = express()
  , server = require('http').createServer(app)
  , io = io.listen(server);
var sharedsession = require("express-socket.io-session");
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')({
  secret: 'node.js rocks',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
});
app.use(session);
io.use(sharedsession(session, {
  autoSave: true
}));
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var cors = require('cors');
const config = require('./config')
var mongoose = require('mongoose');
var users = 0;
const Chats = fq("models/chats");
const Conversations = fq("models/conversations");

/* 
 *
 * Websoclets Handlers
 * 
*/

const onlinePeople = [];

io.on('connection', function (socket) {

  if (socket.handshake.session.account) {
    if (!onlinePeople.includes(socket.handshake.session.account.name)) {
      onlinePeople.push(socket.handshake.session.account.name);
      socket.userName = socket.handshake.session.account.name
      console.log("Online : ", onlinePeople);
      io.to(socket.userName).emit("update-status", "online");
      console.log("Told everyone that", socket.userName, "is online");
    }
  }

  socket.on("disconnect", () => {
    const index = onlinePeople.indexOf(socket.userName);
    onlinePeople.splice(index, 1);
    console.log("Online : ", onlinePeople);
    io.to(socket.userName).emit("update-status", "offline");
    console.log("Told everyone that", socket.userName, "is offline");
  })

  socket.on("join-room", (name) => {
    console.log(socket.id, " is joining room", name)
    socket.join(name);
    socket.to(name).emit("update-status", "online");
  })

  socket.on("leave-room", (name) => {
    console.log(socket.id, " is leaving room", name)
    socket.leave(name);
    // socket.to(chatId).emit("update-status", "offline");
    socket.handshake.session.chatId = null;




  })

  socket.on("get-status", (username) => {
    console.log("Request was made for status  for", username, onlinePeople)
    if (onlinePeople.includes(username)) {
      io.to(username).emit("update-status", "online");
      console.log(" is online")
    } else {
      io.to(username).emit("update-status", "offline")
    }
    console.log("Request status was sent to rooms", username);
  })

  socket.on("new-message", (data) => {
    console.log("Got a message : ", data);
    var newText = new Conversations({
      from: data.from,
      date: Date.now(),
      message: data.message,
      chatId: data.chatId
    })
    newText.save((err, savedText) => {
      if (err) {
        console.error("Error while saving socket message to db", err)
      } else {
        io.to(data.chatId).emit("new-message", savedText);
      }
    })
  })

});

app.io = io;
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
mongoose.connect(config.mongoString, { useNewUrlParser: true });
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
  origin: config.allowedOrigins,
  credentials: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}


function getPort() {
  return normalizePort(process.env.PORT || '3000');
}

server.listen(getPort());
module.exports = app;
