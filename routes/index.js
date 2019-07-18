var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
const fq = require('fuzzquire');
const accounts = fq('models/accounts')
const login = fq("routes/login")
const myChats = fq("routes/myChats")
router.use("/login", login)
router.use("/my-chats", myChats);
/* GET home page. */
router.get('/', function (req, res, next) {
  req.app.io.emit('test', "this is a message");
  if (req.session.account) {
    res.json("LOGGED IN")
  } else {
    res.json("PLEASE LOG IN")
  }
});
module.exports = router;
