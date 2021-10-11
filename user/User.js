const mongoose = require('mongoose');
const UserSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String
})
mongoose.model('User', UserSchema);
module.exports = mongoose.model('User');