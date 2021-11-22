const mongoose = require('mongoose');
const InvitationSchema = mongoose.Schema({
    bilboardId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bilboard"
    },
    bilboardName: String,
    member:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    auth:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    aprobe: Number
})
mongoose.model('Invitations', InvitationSchema);
module.exports = mongoose.model('Invitations');