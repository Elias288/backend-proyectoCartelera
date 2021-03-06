var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');

router.use(bodyParser.urlencoded({ extended: true }));
var Task = require('./Task');
const { runInNewContext } = require('vm');

/////////////////////////////////////////NEW/////////////////////////////////////////
router.post('/new', function(req, res) {
    if(!req.body.titulo) return res.status(401).send("Error, falta un titulo");
    if(!req.body.descripcion) return res.status(401).send("Error, falta una descripcion");

    Task.create({
            titulo: req.body.titulo,
            descripcion: req.body.descripcion
        },
        function(err, task) {
            if (err) return res.status(500).send("Error al crear la tarea.");
            else return res.status(200).send(task);
        });
});

/////////////////////////////////////////FIND/////////////////////////////////////////
router.get('/:id', function(req, res) {
    Task.findById(req.params.id, function(err, task) {
        if (err) return res.status(500).send("Error al encontrar la tarea.");
        if (!task) return res.status(404).send("No existe la terea.");
        res.status(200).send(task);
    });
});

/////////////////////////////////////////NEW/////////////////////////////////////////
router.post('/modify', function(req, res) {
    const filter={_id:decoded.id}
    const update={name:req.body.titulo, email:req.body.descripcion}

    Task.findOneAndUpdate(filter, update, { returnOriginal:false },
            function(err, task) {
                if (err) return res.status(500).send("Error al modificar la tarea.");
                else return res.status(200).send("Modificada con exito.");
        });
});
/////////////////////////////////////////DELETE/////////////////////////////////////////
router.delete('/delete', function(req, res) {
    Task.findByIdAndRemove(req.body.idTask, function(err, task) {
        if (err) return res.status(500).send("Error al completar tarea.");
        res.status(200).send("Tarea " + task.titulo + " completada.");
    });
});

module.exports = router;