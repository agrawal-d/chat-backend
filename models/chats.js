const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const chatSchema = new Schema({
    people: [String],
    date: {
        type: Date,
        default: Date.now(),
    },
})


const chat = mongoose.model("chat", chatSchema, "chats");
module.exports = chat;