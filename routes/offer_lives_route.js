var express = require('express');
var router = express.Router();
var ERROR_CODE = require('../const/error_code');
var OfferLives = require('../models/offer_lives');
var GroupObjects = require('../models/group_objects');
var Users = require('../models/users');
var utils = require('../methods/utils');
const ROLE = require('../const/role_const');
// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
    console.log('Time: ', Date.now())
    if(!req.session.loggedIn) {
        res.send({
            errorCode: ERROR_CODE.NOT_LOGIN
        });
        return;
    }
    next()
})

router.use(['/create', '/delete', '/edit'],function timeLog (req, res, next) {
    console.log('Time 111: ', Date.now())
    if(req.session.role == ROLE.VIEWER) {
        res.send({
            errorCode: ERROR_CODE.NOT_PERMISSION
        });
        return;
    }
    next()
})

router.get('/list', function (req, res, next) {
    utils.Utility.checkStatusOfferLive();
    OfferLives.find({}, function (err, offer_lives) {
        if(err) {
            res.send({
                errorCode: ERROR_CODE.FAIL
            });
            return;
        }
        res.send({
            errorCode: ERROR_CODE.SUCCESS,
            data: offer_lives
        });
    });
});

router.post('/create', async function (req, res, next) {
    var body = {
        idObject: req.body.idObject,
        idOffer: req.body.idOffer,
        timeStart: req.body.timeStart,
        timeFinish: req.timeFinish
    };
    console.log("id object" + body.idObject);
    //TODO kiem tra dieu kien object do da duoc live offer hay chua
    OfferLives.create({
        groupOffer: body.idOffer,
        groupObject: body.idObject,
        timeStart: body.timeStart,
        timeFinish: body.timeFinish
    }, function (error, raw) {
        if(error) {
            res.send({errorCode: ERROR_CODE.FAIL});
            return;
        }
        GroupObjects.findById(body.idObject, function (error1, groupO) {
            if(groupO) {
                groupO.offerLive = raw._id;
                groupO.save();
                //notify to all users of group object
                Users.find({
                    groupObject: groupO._id
                }, function (err, users) {
                    for(var i in users) {
                        users[i].isModifiedOffer = true;
                        users[i].save();
                    }
                });
            }
        });
    
        res.send({errorCode: ERROR_CODE.SUCCESS});
    });

});

router.post('/delete', function (req, res, next) {
    var body = {
        idOfferLive: req.body.idOfferLive
    };
    OfferLives.findByIdAndRemove(body.idOfferLive, function (err) {
        if(err) {
            res.send({
                errorCode: ERROR_CODE.FAIL
            });
        }else{
            GroupObjects.findOne({offerLive: body.idOfferLive}, function (error1, groupO) {
                if(groupO) {
                    groupO.offerLive = null;
                    groupO.save();
                    //notify to all users of group object
                    Users.find({
                        groupObject: groupO._id
                    }, function (err, users) {
                        for(var i in users) {
                            users[i].isModifiedOffer = true;
                            users[i].save();
                        }
                    });
                }
            });

            res.send({
                errorCode: ERROR_CODE.SUCCESS
            });
        }
    });
});

router.post('/edit', function (req, res, next) {
    var body = {
        idOfferLive: req.body.idOfferLive,
        dataModify: req.body.dataModify
    };
    OfferLives.findOneAndUpdate({_id: body.idOfferLive}, body.dataModify, {new: true}, function (err, offerLive) {
        if(err) {
            res.send({
                errorCode: ERROR_CODE.FAIL
            });
            return;
        }
        //notify to all users of group object
        Users.find({
            groupObject: offerLive.groupObject
        }, function (err, users) {
            for(var i in users) {
                users[i].isModifiedOffer = true;
                users[i].save();
            }
        });
        res.send({
            errorCode: ERROR_CODE.SUCCESS,
            data: offerLive
        });
    });
});
module.exports = router;