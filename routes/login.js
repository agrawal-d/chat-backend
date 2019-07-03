var express = require('express');
var router = express.Router();
const fq = require("fuzzquire");
const Account = fq("models/accounts");
const crypto = require('crypto');
const config = fq("config.js");
const secret = config.secret;
const senderror = fq("checkandsenderror.js")

router.post("/", function (req, res) {
    if (!req.body.password || !req.body.name) {
        res.json({
            error: "Invaild details"
        })
        console.log("/login input invalid", req.body)
        return;
    }
    const passwordHash = crypto.createHmac('sha256', secret)
        .update(req.body.password)
        .digest('hex');

    if (req.body.newAccount) {
        Account.find({
            name: req.body.name,
        }, function (err, accounts) {
            if (!senderror(err, res)) {
                if (accounts.length > 0) {
                    res.json({
                        error: "Please choose a different name, the one you chose exists."
                    })
                } else {
                    const newAccount = new Account({
                        name: req.body.name,
                        password: passwordHash
                    })
                    newAccount.save(function (err, account) {
                        if (!senderror(err, res)) {
                            req.session.account = {
                                name: account.name,
                                id: account._id,
                            };
                            res.json({
                                login: true,
                                newAccount: true,
                                name: account.name
                            })
                        }
                    })
                }
            }

        })
    } else {
        Account.find({
            name: req.body.name,
            password: passwordHash
        }, function (err, account) {
            if (err) {
                res.json({
                    error: err
                })
                console.error("/login account search", err);
            } else if (!account || account.length === 0) {
                console.log("/login account found", account)
                res.json({
                    login: false,
                    error: "No accout found with matching credentials"
                })
            } else {
                req.session.account = {
                    name: account.name,
                    id: account._id,
                };
                res.json({
                    login: true,
                    newAccount: false,
                    name:account.name
                })
            }
        })
    }
})



module.exports = router;
