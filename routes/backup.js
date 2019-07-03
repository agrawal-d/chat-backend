var express = require('express');
var router = express.Router();
const fq = require("fuzzquire");
const Account = fq("models/accounts");
const crypto = require('crypto');
const config = fq("config.js");
const secret = config.secret;
const senderror = fq("checkandsenderror.js");
const Chats = fq("models/chats");
const Conversations = fq("models/conversations");

router.get("/test", function (req, res) {
    Conversations.find(function (err, conv) {
        {
            console.log(conv);
        }
        res.end();
    })
})

router.get("/", function (req, res) {
    const convs = [];
    if (!req.session.account) {
        console.log("Session at /my-chats", req.session)
        res.json({
            error: "/my-chats, Your login session has expired, please login again."
        });
    } else {
        console.log("SESS", req.session.account.name);
        Chats.find({
            people: req.session.account.name
        }).sort({
            date: -1,
        }).exec(function (err, chats) {
            if (err) {
                res.json({ error: err });
                return;
            } else {
                for (element of chats) {
                    Conversations.find({
                        chatId: element.id
                    }).sort({
                        date: -1
                    }).exec((err, conversations) => {

                        if (err) {
                            res.json({ error: err });

                        } else if (conversations.length == 0) {
                            console.error("No conversation found with Id", element.id)
                        }
                        else {
                            // console.log('Found a conversation', conversations);
                            // console.log(element.people, req.session.account.name);
                            const index = (!element.people.indexOf(req.session.account.name)) ? 1 : 0;
                            // console.log("index", index)
                            // console.log("ID", element.id)
                            convs.push({
                                name: element.people[index],
                                messages: conversations
                            })

                        }
                    })
                }
                console.log("COnv", convs)
                res.json(convs);
            }

        })
    }
})


module.exports = router;
