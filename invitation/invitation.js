const mongoose = require('mongoose');
const InvitationSchema = mongoose.Schema({
    bilboard:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bilboard"
    },
    member:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    auth:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    aprobe: false
})
mongoose.model('Invitations', InvitationSchema);
module.exports = mongoose.model('Invitations');