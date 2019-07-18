var createError = require('http-errors');
var express = require('express');
var http = require('http');
var io = require('socket.io');

var app = express()
  , server = require('http').createServer(app)
  , io = io.listen(server);
app.io = io;
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var cors = require('cors');
const config = require('./config')
var mongoose = require('mongoose');
var users = 0;
io.on('connection', function (socket) {
  console.log("Users (+): ", ++users);
  socket.on("disconnect", function () {
    console.log("Users (-): ", --users)
  })

  socket.on("join-room", function (msg) {
    console.log("Joined  ", msg);
    socket.join(msg)

  })


  socket.on("new-message", function (data) {



    console.log("Got a new message", data);
    socket.to(data.chatId).emit("new-message", {
      message: data.message,
      date: Date.now(),
      id: Math.random(),
      from: data.from,
    });



  })


});



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(session({
  secret: 'node.js rocks',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

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
