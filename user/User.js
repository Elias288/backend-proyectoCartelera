const mongoose = require('mongoose');
const UserSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    bilboards: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Bilboard"
        }
      ]
})
mongoose.model('User', UserSchema);
module.exports = mongoose.model('User');