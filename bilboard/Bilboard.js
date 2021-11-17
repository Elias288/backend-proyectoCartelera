const mongoose = require('mongoose');

const BilboardSchema = mongoose.Schema({
    projectName: String,
    authId: {//id del autor
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    tasks: {//id de la tarea
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task"
    },
    authEmail: String, 
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