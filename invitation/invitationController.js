var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));

var jwt = require('jsonwebtoken');
var config = require('../config');

var Invitation = require('./invitation');
var Bilboard = require('../bilboard/Bilboard');
var User = require('../user/User')
const { runInNewContext } = require('vm');

function findBilboard(bilboardId, res){
    return new Promise(resolve =>{
        Bilboard.findById(bilboardId, function(err, bilboard) {
            if (err) return res.status(500).send('Error.');
            if (!bilboard) return res.status(404).send('No existe cartelera.');
            resolve(bilboard);
        });
    });
}

function findUser(userId, res){
    return new Promise(resolve => {
        User.findById(userId, function(err, user){
            if (err) return res.status(500).send('Error.');
            if (!user) return res.status(404).send('No existe usuario.');
            resolve(user);
        });
    });
}

function findInvitation(invitationId, res){
    return new Promise(resolve => {
        Invitation.findById(invitationId, function(err, inv){
            if (err) return res.status(500).send('Error.');
            if (!inv) return res.status(404).send('No existe la invitación.');
            resolve(inv);   
        });
    });
}

/*////////////////////////////////////////////////LIST////////////////////////////////////////////////*/
router.get('/list', function(req,res){
    Invitation.find({}, function(err, invitation) {
        if (err) return res.status(500).send("Error al encontrar las invitaciones.");
        res.status(200).send(invitation);
    })
});

/*////////////////////////////////////////////////LISTMEMBER////////////////////////////////////////////////*/
router.get('/my', function(req,res){
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'Sin token' });

    jwt.verify(token, config.secret, function(err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Error de autenticacion' });
        Invitation.find({member: decoded.id}, function(err, invitation) {
            if (err) return res.status(500).send("Error al encontrar las invitaciones.");
            res.status(200).send(invitation);
        })
    });
});

/*////////////////////////////////////////////////LISTBILBOARD////////////////////////////////////////////////*/
router.get('/:bilboardId', function(req,res){
    //req.params.bilboardId
    Invitation.find({bilboardId: req.params.bilboardId}, function(err, invitation) {
        if (err) return res.status(500).send("Error al encontrar las invitaciones.");
        const memlist = invitation.map(function(i){return i.member});
        res.status(200).send(memlist);
    })
});

/*////////////////////////////////////////////////NEW////////////////////////////////////////////////*/
router.post('/new', async function(req, res) { //solo el auth de una bilboard puede llamar esta funcion
    //bilboardId
    //authId
    //bilboardName
    //userId

    const bilboard = await findBilboard(req.body.bilboardId, res);

    if(!req.body.authId) return res.status(404).send('Error! Falta autor.');
    if(bilboard.authId.toString()!= req.body.authId.toString()) //si no es el author es el que envia
        return res.status(404).send('Error! Usuario no autorizado.');

    //si no existe
    Invitation.findOne({bilboardId: req.body.bilboardId, member:req.body.userId}, function(err, inv){
        if (err) return res.status(500).send("Error al encontrar la invitacion.");
        if(inv) return res.status(500).send("Error la invitacion ya existe.");

        Invitation.create({
            bilboardId: req.body.bilboardId,
            bilboardName: req.body.bilboardName,
            member: req.body.userId,
            auth: req.body.authId,
            aprobe: 0
            },
            function(err) {
                if (err) return res.status(500).send("Error al enviar la invitación.");
                res.status(200).send("Invitación enviada con éxito.");
            }
        );
    });
});

/*////////////////////////////////////////////////ANSWER////////////////////////////////////////////////*/
router.post('/answer', async function(req, res){
    //memberId
    //invitationId
    //option

    const member = await findUser(req.body.memberId, res)
    const invitation = await findInvitation(req.body.invitationId, res)
    const bilboard = await findBilboard(invitation.bilboardId, res)
    const memberList = bilboard.members;

    if(invitation.member.toString()===member._id.toString()){
        
        //si se modifica la invitacion y la opcion es true
        Invitation.findByIdAndUpdate(req.body.invitationId, {aprobe: req.body.option==="true"? 1 : 0}, function(err){
            if(err) return res.status(500).send('Error al modificar invitacion.');
        })

        if(req.body.option){
            if(memberList.find(m => m.equals(member._id))) //si el usuario ya es miembro
                res.status(500).send("Error!! ya es miembro de esta cartelera");
            else{   //si el usuario no es miembro
                //agrega el usuario a la cartelera
                Bilboard.findByIdAndUpdate(invitation.bilboardId, {$push: {members: member._id}},{new: true, useFindAndModify: false}, 
                function(err){
                    if(err) return res.status(500).send("Error al agregar usuario a la cartelera.");
                    
                    //actualiza la invitacion a 1:aceptado o 0:rechazado
                    res.status(200).send("Usuario agregado con exito.");
                })
            }   
        }

    }else
        return res.status(500).send("Error Usuario incorrecto.");
})

/*////////////////////////////////////////////////DELETE////////////////////////////////////////////////*/
router.delete('/delete', function(req, res) {
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'Sin token' });

    if(!req.body.idBilboard) return res.status(404).send("Error, falta bilboard");

    jwt.verify(token, config.secret, function(err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Error de autenticacion' });

        //busca y borra la invitacion donde el bilboard y el usuario coincidan
        Invitation.findByIdAndRemove({$and : [{bilboardId: req.body.idBilboard}, {member: decoded.id}] }, function(err) {
            if (err) return res.status(500).send("Error al eliminar invitacion.");
            return res.status(200).send("Invitacion eliminada con exito.");
        });

    });
});

module.exports = router;