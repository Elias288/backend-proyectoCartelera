var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

router.use(bodyParser.urlencoded({ extended: true }));
var User = require('./User');

router.post('/new', function(req, res) {
    var hashedPassword = bcrypt.hashSync(req.body.password, 8);
    User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        },
        function(err, user) {
            if (err) return res.status(500).send("Error.");
            var token = jwt.sign({ id: user._id }, config.secret, {
                expiresIn: 86400 // expira en 24 horas
            });
            res.status(200).send({ auth: true, token: token });
        });
});

router.get('/', function(req, res) {
    User.find({}, function(err, users) {
        if (err) return res.status(500).send("Error al encontrar usuarios.");
        res.status(200).send(users);
    });
});

router.post('/login', function(req, res) {
    User.findOne({ email: req.body.email }, function(err, user) {
        if (err) return res.status(500).send('Error.');
        if (!user) return res.status(404).send('No existe usuario.');

        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

        var token = jwt.sign({ id: user._id }, config.secret, {
            expiresIn: 7200 // expira en 2 horas
        });
        res.status(200).send({ auth: true, token: token });
    });
});

module.exports = router;