var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');

router.use(bodyParser.urlencoded({ extended: true }));
var User = require('./User');
var invitation = require('../invitation/invitation');
const { runInNewContext } = require('vm');

/////////////////////////////////////////NEW/////////////////////////////////////////
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

/////////////////////////////////////////ME/////////////////////////////////////////
router.get('/me', function(req, res) {
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'Sin token' });

    jwt.verify(token, config.secret, function(err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Error de autenticacion' });
        User.findById(decoded.id, function(err, user) {
            if (err) return res.status(500).send("Error al buscar usuario.");
            if (!user) return res.status(404).send("No existe el usuario.");
            res.status(200).send(user);
        });
    });
});

/////////////////////////////////////////LIST/////////////////////////////////////////
router.get('/list', function(req, res) {
    User.find({}, function(err, users) {
        if (err) return res.status(500).send("Error al encontrar usuarios.");
        res.status(200).send(users);
    });
});

/////////////////////////////////////////LOGIN/////////////////////////////////////////
router.post('/login', function(req, res) {
    User.findOne({ email: req.body.email }, function(err, user) {
        if (err) return res.status(500).send('Error.');
        if (!user) return res.status(404).send('No existe usuario.');
        if(!req.body.password) return res.status(401).send('No se ingreso una contraseña');

        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) return res.status(401).send('Contraseña incorrecta');
        /* if (!passwordIsValid) return res.status(401).send({ auth: false, token: null }); */
    
        var token = jwt.sign({ id: user._id }, config.secret, {
            expiresIn: 7200 // expira en 2 horas
        });
        res.status(200).send({ auth: true, token: token, user, user});
        
    });
});

/////////////////////////////////////////VIEW/////////////////////////////////////////
router.get('/:id', function(req, res) {
    User.findById(req.params.id, function(err, user) {
        if (err) return res.status(500).send("Error al encontrar usuario.");
        if (!user) return res.status(404).send("No existe el usuario.");
        res.status(200).send(user);
    });
});

/////////////////////////////////////////EDIT/////////////////////////////////////////
router.put('/:id', /* VerifyToken, */ function(req, res) {
    User.findByIdAndUpdate(req.params.id, req.body, { new: true }, function(err, user) {
        if (err) return res.status(500).send("Error al actualizar usuario.");
        res.status(200).send(user);
    });
});

/////////////////////////////////////////DELETE/////////////////////////////////////////
router.delete('/:id', function(req, res) {
    User.findByIdAndRemove(req.params.id, function(err, user) {
        if (err) return res.status(500).send("Error al eliminar actualizar usuario.");
        res.status(200).send("User: " + user.name + " eliminado.");
    });
});

/////////////////////////////////////////NEW/////////////////////////////////////////
router.post('/modify', function(req, res) {
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'Sin token' });
    jwt.verify(token, config.secret, function(err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Error de autenticacion' });

        const filter={_id:decoded.id}
        const update={name:req.body.name, email:req.body.email}

        User.findOneAndUpdate(filter, update, { returnOriginal:false },
            function(err, user) {
                if (err) return res.status(500).send("Error al modificar el usuario.");
                /* else return res.status(200).send("Modificado con exito."); */
                else return res.status(200).send({ auth: true, token: token, user, user});
        });
    });
    
});

/////////////////////////////////////////ADDBILBOARD/////////////////////////////////////////
router.post('/addbilboard', function(req, res){
    user.findByIdAndUpdate(
        req.body.idUser,
        {$push: {bilboards: req.body.idBilboard}},
        {new: true, useFindAndModify: false},
        function(err){
            if(err) return res.status(500).send("Error al agregar cartelera.");
            else return res.status(200).send("Cartelera agregada con exito.");
        }    
    )
});

module.exports = router;