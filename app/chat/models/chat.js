const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
    user: {
        type:  Schema.Types.ObjectId,
        ref: 'User',
    },
    message: [{
        type: String,
    }],
    recipient: {
        type:  Schema.Types.ObjectId,
        ref: 'User',
    },
    timeSent: {
        type: Date,
        default: Date.now(),
    },
}, {
    timestamps: true
});

const Chat = mongoose.model('Chat', ChatSchema);

module.exports = Chat;
