const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please provide a room name'],
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    members: [
       {
            type: Schema.Types.ObjectId,
            ref: 'User',
       }
    ],
    chats: [
        {
            messages: String,
            ref: 'Chat',
        }
    ]
});

const Room = mongoose.model('Room', RoomSchema);
module.exports = Room;