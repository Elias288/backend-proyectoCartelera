var express = require('express')
var app = express()
var cors = require('cors')
global.__root = __dirname + '/';

var db = require('./database')
//const User = require('./model/Users/User')

app.use(cors())
app.use(express.json())

app.get('/', function(req, res){
    res.status(200).send('<h1>Welcome to Backend-proyectoCartelera!!</h1>')
})

var UserController = require(__root + 'user/UserController');
app.use('/users', UserController);

module.exports = app;