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

io.on('connection', function (socket) {

  console.log("Users (+): ", ++users);
  socket.on("disconnect", function () {
    console.log("Users (-): ", --users)
  })

  socket.on("join-room", function (chatId) {
    console.log(socket.id, " is joining room", chatId)
    socket.join(chatId);
  })

  socket.on("leave-room", function (chatId) {
    console.log(socket.id, " is leaving room", chatId)
    socket.leave(chatId);
  })

  socket.on("new-message", function (data) {
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
// view engine setup
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
server.listen(3000);
module.exports = app;
