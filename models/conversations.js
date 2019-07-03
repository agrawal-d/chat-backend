const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const conversationSchema = new Schema({
    from: String,
    chatId: String,
    date: {
        type: Date,
        default: Date.now()
    },
    message: String,
})

const conversation = mongoose.model("conversation", conversationSchema, "conversations");

module.exports = conversation;