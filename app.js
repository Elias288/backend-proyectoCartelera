var express = require('express')
var app = express()
var cors = require('cors')
global.__root = __dirname + '/';

var db = require('./database')
//const User = require('./model/Users/User')

app.use(cors({ credentials: true }))
app.use(express.json())

app.get('/', function(req, res){
    res.status(200).send('<h1>Welcome to Backend-proyectoCartelera!!</h1>')
})
//////////////////////////////////////////USER//////////////////////////////////////////
var UserController = require(__root + 'user/UserController');
app.use('/users', UserController);
//////////////////////////////////////////BILBOARD//////////////////////////////////////////
var BilboardController = require(__root + 'bilboard/BilboardController');
app.use('/bilboards', BilboardController);
//////////////////////////////////////////INVITATION//////////////////////////////////////////
var Searcher = require(__root + 'invitation/invitationController');
app.use('/invitation', Searcher);
//////////////////////////////////////////TASK//////////////////////////////////////////
var TaskController = require(__root + 'task/TaskController');
app.use('/tasks', TaskController);

module.exports = app;