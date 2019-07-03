const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const accountsSchema = new Schema({
    name: String,
    password: String,
    date: String,
    settings: [Array]
})

const accounts = mongoose.model("accounts", accountsSchema, "accounts");

module.exports = accounts;