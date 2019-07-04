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
                })
            }

        })
    }
})
    +

    router.post('/new-messages', function (req, res) {
        if (!req.session.account) {
            res.json({
                error: "Login Session Expired"
            })
        } else {
            const dateFilter = req.body.date;
            const chatId = req.body.chatId;
            const query = Conversations.find({
                date: {
                    $gt: dateFilter
                },
                chatId: chatId
            })

            query.exec(function (err, conversation) {
                if (err) {
                    res.json({
                        error: err
                    })
                    console.log("Error att /mew-message", err);
                } else {
                    res.json(conversation)
                }
            })


        }
    })

router.post("/submit-message", function (req, res) {
    if (req.body.message && req.body.message.length > 0 && req.body.chatId && req.body.from && req.session.account) {
        const conversation = new Conversations({
            chatId: req.body.chatId,
            message: req.body.message,
            from: req.body.from,
            date: Date.now()
        })

        conversation.save(function (err) {
            if (err) {
                res.json({
                    error: err
                })
            } else {
                res.json({
                    success: true
                })
            }
        })
    } else {
        res.json({
            error: "Error, invalid parameters in req.body OR session expired."
        })
    }
})

router.post("/search", function (req, res) {
    if (req.session.account && req.body.people && req.body.query) {
        const people = req.body.people;
        console.log(people)
        console.log(typeof (people))
        console.log(req.session.account.name)
        people.push(req.session.account.name)
        Account.findOne({
            $and: [
                { name: { $nin: people } },
                { name: req.body.query }
            ]
            ,
        }, function (err, account) {
            if (err) {
                res.json(
                    { errors: err }
                )
                console.error("Search - >", err);
            } else {
                if (account) {
                    const chat = new Chats({
                        people: [account.name, req.session.account.name],
                        date: Date.now()
                    });
                    chat.save(function (err, savedChat) {
                        if (err) {
                            res.json({
                                error: err
                            })
                        } else {
                            const botText = new Conversations({
                                chatId: savedChat.id,
                                from: "Chat Bot Automoderator",
                                message: "Welcome to chat. Please ensure you follow all the rules. Your chats are private",
                                date: Date.now()
                            })

                            botText.save(function (err, savedBotText) {
                                if (err) {
                                    res.json({
                                        error: err
                                    })
                                } else {
                                    res.json({
                                        name: account.name,
                                        messages: [
                                            savedBotText
                                        ],
                                        date: Date.now()
                                    });
                                }
                            })
                        }
                    })
                } else {
                    res.json({
                        empty: true
                    })
                }
            }
        })
    } else {
        res.error({
            error: "Check session or request parameters."
        })
    }
})


module.exports = router;
