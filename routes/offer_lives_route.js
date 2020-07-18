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
    if(req.path != "/offer_lives/tracking_show") {
        if(!req.session.loggedIn) {
            res.send({
                errorCode: ERROR_CODE.NOT_LOGIN
            });
            return;
        }
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
    var gameId = req.query.gameId;
    utils.TimeUtility.checkStatusOfferLive(gameId);
    OfferLives.getModel(gameId).find({}).populate("groupOffer").exec(function (err, offer_lives) {
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
    var gameId = req.query.gameId;
    var body = {
        idObject: req.body.idObject,
        idOffer: req.body.idOffer,
        timeStart: utils.TimeUtility.convertTimeClientToTimeServer(gameId, req.body.timeStart),
        timeFinish: utils.TimeUtility.convertTimeClientToTimeServer(gameId, req.body.timeFinish)
    };
    //check moi user chi co 1 offer
    var offerLive = await OfferLives.getModel(gameId).findOne({groupObject: body.idObject, groupOffer: body.idOffer}, function (err, offerLive) {

    });
    if(offerLive) {
        console.log("da ton tai offer live " + body.idObject + " | " + body.idOffer);
        return res.send({errorCode: ERROR_CODE.EXIST});
    }
    console.log("id object" + body.idObject);
    //TODO kiem tra dieu kien object do da duoc live offer hay chua
    await OfferLives.getModel(gameId).create({
        groupOffer: body.idOffer,
        groupObject: body.idObject,
        timeStart: body.timeStart,
        timeFinish: body.timeFinish
    }, async function (error, raw) {
        if(error) {
            res.send({errorCode: ERROR_CODE.FAIL});
            return;
        }
        await GroupObjects.getModel(gameId).findById(body.idObject, function (error1, groupO) {
            if(groupO) {
                groupO.offerLive = raw._id;
                groupO.save();
                //notify to all users of group object
                Users.getModel(gameId).find({
                    groupObject: groupO._id
                }, function (err, users) {
                    for(var i in users) {
                        users[i].isModifiedOffer = true;
                        users[i].save();
                    }
                });
            }
        });
    
        res.send({errorCode: ERROR_CODE.SUCCESS, data: raw});
    });

});

router.post('/delete', function (req, res, next) {
    var gameId = req.query.gameId;
    var body = {
        idOfferLive: req.body.idOfferLive
    };
    OfferLives.getModel(gameId).findByIdAndRemove(body.idOfferLive, function (err) {
        if(err) {
            res.send({
                errorCode: ERROR_CODE.FAIL
            });
        }else{
            GroupObjects.getModel(gameId).findOne({offerLive: body.idOfferLive}, function (error1, groupO) {
                if(groupO) {
                    groupO.offerLive = null;
                    groupO.save();
                    //notify to all users of group object
                    Users.getModel(gameId).find({
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
    var gameId = req.query.gameId;
    var body = {
        idOfferLive: req.body.idOfferLive,
        dataModify: req.body.dataModify
    };
    if(body.dataModify.timeStart) {
        body.dataModify.timeStart = utils.TimeUtility.convertTimeClientToTimeServer(gameId, body.dataModify.timeStart);
    }
    if(body.dataModify.timeFinish) {
        body.dataModify.timeFinish = utils.TimeUtility.convertTimeClientToTimeServer(gameId, body.dataModify.timeFinish);
    }

    OfferLives.getModel(gameId).findOneAndUpdate({_id: body.idOfferLive}, body.dataModify, {new: true}, function (err, offerLive) {
        if(err) {
            res.send({
                errorCode: ERROR_CODE.FAIL
            });
            return;
        }
        //notify to all users of group object
        Users.getModel(gameId).find({
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

router.get("/tracking_show", async function (req, res, next) {
    var gameId = req.query.gameId;
    var idOfferLive = req.query.idOfferLive;
    if(gameId == null || idOfferLive == null) {
        res.send({
            errorCode: ERROR_CODE.FAIL
        });
        return;
    }
    await OfferLives.getModel(gameId).findOne({_id: idOfferLive}, function (err, offerLive) {
        if(err) {
            console.log("tracking_show error: " + err);
            res.send({
                errorCode: ERROR_CODE.FAIL
            });
            return;
        }
        if(offerLive) {
            offerLive.totalShow += 1;
            offerLive.save();
            res.send({
                errorCode: ERROR_CODE.SUCCESS
            });
        }
    });
});
module.exports = router;