var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');

router.use(bodyParser.urlencoded({ extended: true }));
var Bilboard = require('./Bilboard');
const { runInNewContext } = require('vm');



/////////////////////////////////////////FIND/////////////////////////////////////////
router.get('/list', function(req, res) {
    Bilboard.find({}, function(err, bilboard) {
        if (err) return res.status(500).send("Error al encontrar carteleras.");
        res.status(200).send(bilboard);
    });
});
/////////////////////////////////////////NEW/////////////////////////////////////////
router.post('/new', function(req, res) {
    Bilboard.create({
            projectName: req.body.projectName,
            adminEmail: req.body.adminEmail,
            description: req.body.description
        },
        function(err) {
            if (err) return res.status(500).send("Error al crear la cartelera.");
            else return res.status(200).send("Cartelera creada con éxito.");

        });
});

/////////////////////////////////////////NEW/////////////////////////////////////////
router.post('/modify', function(req, res) {
    Bilboard.findOneAndUpdate({_id: req.body._id}, {projectName:req.body.projectName, adminEmail:req.body.adminEmail, description:req.body.description}, { returnOriginal:false },
        function(err) {
            if (err) return res.status(500).send("Error al modificar la cartelera.");
            else return res.status(200).send("Cartelera modificada con exito.");
        });
});

/////////////////////////////////////////ME/////////////////////////////////////////

module.exports = router;