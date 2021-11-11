const mongoose = require('mongoose');

const BilboardSchema = mongoose.Schema({
    projectName: String,
    adminEmail: String,
    description: String,
    members: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        }
      ]
})

mongoose.model('Bilboard', BilboardSchema);
module.exports = mongoose.model('Bilboard');