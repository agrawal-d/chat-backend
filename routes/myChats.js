var express = require('express');
var router = express.Router();
const fq = require("fuzzquire");
const Account = fq("models/accounts");
const crypto = require('crypto');
const config = fq("config.js");
const secret = config.secret;
var assert = require('assert');
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
        var savedChats = null;
        Chats.find({
            people: req.session.account.name
        }).sort({
            date: -1,
        }).exec(function (err, chats) {
            if (err) {
                res.json({ error: err });
                return;
            } else {
                savedChats = chats;
                const promises = [];
                for (element of chats) {

                    const query = Conversations.find({
                        chatId: element.id
                    }).sort({
                        date: 1
                    }).limit(20);
                    var promise = query.exec()
                    console.log("Promise is : ", promise)
                    assert.ok(promise instanceof Promise);
                    promises.push(promise);
                }


                console.log("Promises", promises);
                Promise.all(promises).then(function (listOfConvs) {
                    // console.log(listOfConvs);
                    const convs = []
                    console.log(savedChats);
                    var count = 0;
                    for (element of savedChats) {
                        const index = (!element.people.indexOf(req.session.account.name)) ? 1 : 0;
                        const otherPersonName = element.people[index];
                        convs.push({
                            name: otherPersonName,
                            messages: listOfConvs[count]
                        })
                        count++;
                    }
                    res.json(convs);
                    console.log("Convs", convs)
                    // (err, conversations) => {

                    //     if (err) {
                    //         res.json({ error: err });

                    //     } else if (conversations.length == 0) {
                    //         console.error("No conversation found with Id", element.id)
                    //     }
                    //     else {
                    //         // console.log('Found a conversation', conversations);
                    //         // console.log(element.people, req.session.account.name);
                    //         const index = (!element.people.indexOf(req.session.account.name)) ? 1 : 0;
                    //         // console.log("index", index)
                    //         // console.log("ID", element.id)
                    //         convs.push({
                    //             name: element.people[index],
                    //             messages: conversations
                    //         })
                    //         console.log(convs)

                    //     }
                    // }
                })
            }

        })
    }
})


module.exports = router;
