const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://EleliB:elias123@cluster0.alwth.mongodb.net/proyecto-cartelera',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(db => console.log('connectado a la db'))