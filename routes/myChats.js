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
var chatIdsInitial = [];
router.get("/", function (req, res) {
    const convs = [];
    chatIdsInitial = [];
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
                    chatIdsInitial.push(element.id);
                    const query = Conversations.find({
                        chatId: element.id
                    }).sort({
                        date: 1
                    }).limit(100);
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
                            messages: listOfConvs[count],
                            id: chatIdsInitial[count]
                        })
                        count++;
                    }
                    res.json(convs);
                })
            }

        })
    }
})

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
                                        id: savedChat.id,
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
const chatIds = [];
router.post("/refresh-chats", function (req, res) {
    chatids = [];
    const promises = [];
    var savedChats = [];
    if (req.session.account && req.body.people) {
        const query = Chats.find({
            people: req.session.account.name
        });

        const promise0 = query.exec();

        promise0.then((chats) => {

            return chats

        }).then((chats) => {
            if (!chats || chats.length === 0) {
                res.json({
                    empty: true,
                    reason: "No chats at all for this person."
                })
            } else {
                // console.log("Initial Found chats ->", chats);






                for (element of chats) {
                    chatIds.push(element.id);
                    /*
                    Loop over backend and frontend chats and remove matches, only unique chats are required
                    */
                    const found = element.people.some(r => req.body.people.indexOf(r) >= 0);
                    if (!found) {
                        // console.log(`Well, ${element.people} will be pushed`);
                        savedChats.push(element);

                        const findConvs = Conversations
                            .find({
                                chatId: element.id
                            })
                            .limit(100)
                        promises.push(findConvs.exec());
                    } else {
                        // console.log(`Oops, ${element.people} cant be pushed`);

                    }




                }


            }
        }).finally(() => {
            // console.log("Should be waiting for promises now ...");
            if (promises.length > 0) {
                Promise.all(promises).then(function (listOfConvs) {
                    // console.log("Executing promises");
                    const convs = []
                    var count = 0;
                    console.log("Vaild chats", savedChats)
                    if (savedChats) {
                        for (element of savedChats) {
                            const index = (!element.people.indexOf(req.session.account.name)) ? 1 : 0;
                            const otherPersonName = element.people[index];
                            if (listOfConvs[count]) { // Handles the case when PEOPLE IN FRONTEND CHAT matches with FOUND CHATS.
                                convs.push({
                                    name: otherPersonName,
                                    messages: listOfConvs[count],
                                    date: element.date,
                                    id: chatIds[count]
                                })
                            }

                            count++;
                        }
                        if (convs.length > 0) {
                            res.json(convs);

                        } else {
                            res.json({
                                empty: true
                            })
                        }
                        console.log("Unsaved convs", convs);
                    } else {
                        console.log("No savedChats", savedChats);
                    }


                })
            }

        }).catch((error) => {
            console.log("/refresh-chats final promises error", error);
        })


    } else {
        res.json({
            error: "Invalid session OR invalid request"
        })
        return;
    }
})

module.exports = router;
