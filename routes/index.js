var express = require('express');
var router = express.Router();

var globalChats = [{
  name: "Akul Singhal",
  messages: [
    {
      text: "Hello Divyanshu",
      from: "Akul Singhal",
      id: "csefvwvrvwe"
    }, {
      text: "Hi Akul",
      from: "Divyanshu Agrawal",
      id: "Dcswfcwefcwe"
    },
    {
      text: "Hello Divyanshu",
      from: "Akul Singhal",
      id: "csefvlwvrvwe"
    }, {
      text: "Hi Akul",
      from: "Divyanshu Agrawal",
      id: "Dcswllfcwefcwe"
    },
    {
      text: "Hello Divyanshu",
      from: "Akul Singhal",
      id: "csehfvwvrvwe"
    }, {
      text: "Hi Akul",
      from: "Divyanshu Agrawal",
      id: "Dcuhbswfcwefcwe"
    },
    {
      text: "Hello Divyanshu",
      from: "Akul Singhal",
      id: "csefvuiygvwvrvwe"
    }, {
      text: "Hi Akul",
      from: "Divyanshu Agrawal",
      id: "Dcswbouyfcwefcwe"
    },
    {
      text: "Hello Divyanshu",
      from: "Akul Singhal",
      id: "csefiupvwvrvwe"
    }, {
      text: "Hi Akul",
      from: "Divyanshu Agrawal",
      id: "Dcswp,ofcwefcwe"
    },
    {
      text: "Hello Divyanshu",
      from: "Akul Singhal",
      id: "csefvp,owvrvwe"
    }, {
      text: "Hi Akul",
      from: "Divyanshu Agrawal",
      id: "Dcswvufcwefcwe"
    },
    {
      text: "Hello Divyanshu",
      from: "Akul Singhal",
      id: "cseftucvwvrvwe"
    }, {
      text: "Hi Akul",
      from: "Divyanshu Agrawal",
      id: "Dczewswfcwefcwe"
    },
    {
      text: "Hello Divyanshu",
      from: "Akul Singhal",
      id: "csefjghvwvrvwe"
    }, {
      text: "Hi Akul",
      from: "Divyanshu Agrawal",
      id: "Dcsioywfcwefcwe"
    },
  ]
}, {
  name: "Ashutosh Agrawal",
  messages: [
    {
      text: "Hello Divyanshu",
      from: "Ashutosh Agrawal",
      id: "aweqfcwefcw"
    }, {
      text: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.",
      from: "Divyanshu Agrawal",
      id: "asdcsdacwfea"
    }, {
      text: "But of course , that is correct. 🙂🙂 .Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc. ",
      from: "Ashutosh Agrawal",
      id: "aweqfcwefcwkk"
    }, {
      text: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum",
      from: "Divyanshu Agrawal",
      id: "aweqfcwefcw0"
    }, {
      text: "Bye",
      from: "Ashutosh Agrawal",
      id: "aweqfcwefcw,"
    },
  ]
}, {
  name: "Aditi Pathak",
  messages: []
}
]


router.use(function (req, res, next) {
  console.log("Timed out")
  setTimeout(next, 2000);
})

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log(req.session)
  if (req.session.account) {
    res.json("LOGGED IN")
  } else {
    res.json("PLEASE LOG IN")
  }
});


router.get("/accounts-list", function (req, res, next) {
  res.json(["Akul Singhal", "Divyanshu Agrawal", "Praneeth Reddy", "Orabhleen Kaur", "Aditi Kukreti, Barrak Obama"]);
})

router.get("/my-chats", function (req, res) {
  res.json(globalChats)
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
