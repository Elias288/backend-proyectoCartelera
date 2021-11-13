var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));

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

function findInvitation(InvitationId, res){
    return new Promise(resolve => {
        Invitation.findById(InvitationId, function(err, invitation){
            if (err) return res.status(500).send('Error.');
            if (!invitation) return res.status(404).send('No existe la invitación.');
            resolve(invitation);
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
/*////////////////////////////////////////////////NEW////////////////////////////////////////////////*/
router.post('/new', async function(req, res) { //solo el auth de una bilboard puede llamar esta funcion
    const bilboard = await findBilboard(req.body.bilboardId, res);
    const auth = await findUser(req.body.authId, res);

    if(bilboard.authId.toString()!=auth._id.toString()) return res.status(404).send('Error! Usuario no autorizado.');

    Invitation.create({
        bilboard: req.body.bilboardId,
        member: req.body.userId,
        auth: req.body.authId,
        aprobe: false
        },
        function(err) {
            if (err) return res.status(500).send("Error al enviar la invitación.");
            else return res.status(200).send("Invitación enviada con éxito.");
    });
});

/*////////////////////////////////////////////////ACCEPT////////////////////////////////////////////////*/
router.post('/accept', async function(req, res){
    const member = await findUser(req.body.memberId, res)
    const invitation = await findInvitation(req.body.invitationId, res)

    if(invitation.member===member){
        Invitation.findByIdAndUpdate({_id: invitation._id}, {aprobe: req.body.option}, function(err){
            if (err) return res.status(500).send("Error al responder la invitación.");
                else return res.status(200).send("Invitación respondida con exito.");
        });
    }
})

/*//////////////////////////////////////////////// ////////////////////////////////////////////////*/

module.exports = router;