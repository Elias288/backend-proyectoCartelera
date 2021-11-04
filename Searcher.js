var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));

var User = require('./user/User');
var Bilboard = require('./bilboard/Bilboard')

router.get('/users', function(req, res) {
    var q = req.query.q

    User.find({
        name: {
            $regex: new RegExp(q, 'i')
        }
    },{
        _id:0
    }, function(err, user){
        if (err) return res.status(500).send('Error.');
        if (!user) return res.status(404).send('No hay usuarios.');
        res.status(200).send(user);
    });
});

router.get('/bilboards', function(req, res) {
    var q = req.query.q

    Bilboard.find({
        projectName: {
            $regex: new RegExp(q)
        }
    },{
        _id:0
    }, function(err, bilboard){
        if (err) return res.status(500).send('Error.');
        if (!bilboard) return res.status(404).send('No hay Bilboards.');
        res.status(200).send(bilboard);
    });
});

module.exports = router;