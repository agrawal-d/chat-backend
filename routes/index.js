var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose');
const fq = require('fuzzquire')
const accounts = fq('models/accounts')
const login = fq("routes/login")
const myChats = fq("routes/myChats")
router.use("/login", login)
router.use("/my-chats", myChats);

router.use(function (req, res, next) {
  console.log("Waiting 0.5 seconds before response.")
  setTimeout(next, 500);
})

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log("Session at /" , req.session)
  if (req.session.account) {
    res.json("LOGGED IN")
  } else {
    res.json("PLEASE LOG IN")
  }
});


router.get("/accounts-list", function (req, res, next) {
  res.json(["Akul Singhal", "Divyanshu Agrawal", "Praneeth Reddy", "Orabhleen Kaur", "Aditi Kukreti, Barrak Obama"]);
})




router.post("/login", function (req, res, next) {
  req.session.account = {
    name: "Divyanshu Agrawal",
    email: "hereisdx@gmail.com",
    accessKey: "accessKey"
  }
  console.log(req.session)
  res.json(req.session.account)

})

module.exports = router;
