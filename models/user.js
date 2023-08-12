const mongoose = require('mongoose');

const User = new mongoose.Schema({
    name: { type: String, required: true},
    profileImage: { type: String, required: false},
    email: {type: String, required: true, unique: true },
    password: {type: String}
},{
    timestamps: true,
});


module.exports = mongoose.model('User', User);