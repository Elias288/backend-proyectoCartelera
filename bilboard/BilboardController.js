var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
var Bilboard = require('./Bilboard');
const { runInNewContext } = require('vm');

/////////////////////////////////////////LIST/////////////////////////////////////////
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
            authId: req.body.adminId,
            authEmail: req.body.adminEmail,
            description: req.body.description,
            members: [req.body.adminId]
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
        res.status(200).send(bilboard);
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

module.exports = router;