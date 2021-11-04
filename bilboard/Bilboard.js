const mongoose = require('mongoose');
const BilboardSchema = mongoose.Schema({
    projectName: String,
    adminEmail: String,
    description: String
})
mongoose.model('Bilboard', BilboardSchema);
module.exports = mongoose.model('Bilboard');