const mongoose = require('mongoose');

const Message = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text: { type: String, required: true},
    status: {type: String, default: 0}

},{
    timestamps: true,
});


module.exports = mongoose.model('Message', Message);