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

function ChangeInvitation(InvitationId, option, res){
    Invitation.findByIdAndUpdate(InvitationId, {aprobe: option}, function(err){
        if(err) return res.status(500).send('Error.');
        else return true
    })
}

/*////////////////////////////////////////////////LIST////////////////////////////////////////////////*/
router.get('/list', function(req,res){
    Invitation.find({}, function(err, invitation) {
        if (err) return res.status(500).send("Error al encontrar las invitaciones.");
        res.status(200).send(invitation);
    })
});
/*////////////////////////////////////////////////LISTID////////////////////////////////////////////////*/
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
/*////////////////////////////////////////////////NEW////////////////////////////////////////////////*/
router.post('/new', async function(req, res) { //solo el auth de una bilboard puede llamar esta funcion
    //bilboardId
    //authId
    //bilboardName
    //userId

    const bilboard = await findBilboard(req.body.bilboardId, res);
    const auth = await findUser(req.body.authId, res);

    if(bilboard.authId.toString()!=auth._id.toString()) return res.status(404).send('Error! Usuario no autorizado.');

    Invitation.create({
        bilboardId: req.body.bilboardId,
        bilboardName: req.body.bilboardName,
        member: req.body.userId,
        auth: req.body.authId,
        aprobe:false
        },
        function(err) {
            if (err) return res.status(500).send("Error al enviar la invitación.");
            else return res.status(200).send("Invitación enviada con éxito.");
    });
});

/*////////////////////////////////////////////////ANSWER////////////////////////////////////////////////*/
router.post('/answer', async function(req, res){
    //memberId
    //invitationId
    //option

    const member = await findUser(req.body.memberId, res)
    const invitation = await findInvitation(req.body.invitationId, res)

    if(invitation.member.toString()===member._id.toString()){
        /* return res.status(200).send(invitation.member + ' ' + member._id); */
        if(req.body.option){ //si acepta
            Bilboard.findByIdAndUpdate( //agrega el usuario a la cartelera
                invitation.bilboardId,
                {$push: {members: member._id}},
                {new: true, useFindAndModify: false},
                function(err){
                    if(err) return res.status(500).send("Error al agregar usuario a la cartelera.");
                    else{
                        ChangeInvitation(invitation._id, false);
                        return res.status(200).send("Usuario agregado con exito.");
                    } 
                }    
            )
        }
    }else
        return res.status(500).send("Error Usuario incorrecto.");
})

/*//////////////////////////////////////////////// ////////////////////////////////////////////////*/

module.exports = router;