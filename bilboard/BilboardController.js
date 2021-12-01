var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser');

var jwt = require('jsonwebtoken');
var config = require('../config');

router.use(bodyParser.urlencoded({ extended: true }));
var Bilboard = require('./Bilboard');
const { runInNewContext } = require('vm');

/////////////////////////////////////////LIST/////////////////////////////////////////
router.get('/list', function(req, res) {
    Bilboard.find({}, function(err, bilboard) {
        if (err) return res.status(500).send("Error al encontrar carteleras.");
        return res.status(200).send(bilboard);
    });
});

/////////////////////////////////////////MY/////////////////////////////////////////
router.get('/my', function(req, res) {
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'Sin token' });
    jwt.verify(token, config.secret, function(err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Error de autenticacion' });

        Bilboard.find({ $or:[{ authId: decoded.id}, {members: {"$in" : [decoded.id]}} ] }, function(err, bilboard) {
            if (err) return res.status(500).send("Error al encontrar carteleras.");
            return res.status(200).send(bilboard);
        });
    });
        
});

/////////////////////////////////////////NEW/////////////////////////////////////////
router.post('/new', function(req, res) {
    if(!req.body.projectName) return res.status(401).send("Error, falta un nombre");
    if(!req.body.adminId) return res.status(401).send("Error, falta el id de administrador");
    if(!req.body.description) return res.status(401).send("Error, falta una descripción");

    Bilboard.create({
            projectName: req.body.projectName,
            authId: req.body.adminId,
            authEmail: req.body.adminEmail,
            description: req.body.description,
            members: [req.body.adminId],
            tasks: []
        },
        function(err) {
            if (err) return res.status(500).send("Error al crear la cartelera.");
            else return res.status(200).send("Cartelera creada con éxito.");

        });
});

/////////////////////////////////////////VIEW/////////////////////////////////////////
router.get('/:id', function(req, res) {
    Bilboard.findById(req.params.id, function(err, bilboard) {
        if (err) return res.status(500).send("Error al encontrar carteleras.");
        if (!bilboard) return res.status(404).send("No existe la cartelera.");
        return res.status(200).send(bilboard);
    });
});

/////////////////////////////////////////MODIFY/////////////////////////////////////////
router.post('/modify', function(req, res) {
    Bilboard.findOneAndUpdate({_id: req.body.idBilboard}, {projectName:req.body.projectName, adminId:req.body.adminId, description:req.body.description}, { returnOriginal:false },
        function(err) {
            if (err) return res.status(500).send("Error al modificar la cartelera.");
            else return res.status(200).send("Cartelera modificada con exito.");
        });
});

/////////////////////////////////////////ADDUSER/////////////////////////////////////////
router.post('/adduser', function(req, res){
    Bilboard.findByIdAndUpdate(
        req.body.idBilboard,
        {$push: {members: req.body.idUser}},
        {new: true, useFindAndModify: false},
        function(err){
            if(err) return res.status(500).send("Error al agregar usuario a la cartelera.");
            else return res.status(200).send("Usuario agregado con exito.");
        }    
    )
});
/////////////////////////////////////////UNSUSBSCRIBEME/////////////////////////////////////////
router.post('/unsubscribeme', function(req, res){
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'Sin token' });

    jwt.verify(token, config.secret, function(err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Error de autenticacion' });

        if(!req.body.idBilboard) return res.status(404).send("Error, falta bilboard");

        Bilboard.findByIdAndUpdate(
            req.body.idBilboard,
            {$pull: {members: decoded.id}},
            {new: true},
            function(err){
                if(err) return res.status(500).send("Error al dar de baja.");
                return res.status(200).send("Usuario dado de baja con exito.");
            }    
        )
    });
});

/////////////////////////////////////////ADDTASK/////////////////////////////////////////
router.post('/addtask', function(req, res){
    Bilboard.findByIdAndUpdate(
        req.body.idBilboard,
        {$push: {tasks: req.body.idTask}},
        {new: true, useFindAndModify: false},
        function(err){
            if(err) return res.status(500).send("Error al agregar tarea a la cartelera.");
            else return res.status(200).send("Tarea agregada con exito.");
        }    
    )
});

module.exports = router;