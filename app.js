var express = require('express')
var app = express()
var cors = require('cors')
global.__root = __dirname + '/';

var db = require('./database')
//const User = require('./model/Users/User')

app.use(cors())
app.use(express.json())

app.get('/api', function(req, res){
    res.status(200).send('API works.');
})

var UserController = require(__root + 'user/UserController');
app.use('/api/users', UserController);

module.exports = app;