const mongoose = require('mongoose');
const TaskSchema = mongoose.Schema({
    titulo: String,
    descripcion: String
})
mongoose.model('Task', TaskSchema);
module.exports = mongoose.model('Task');