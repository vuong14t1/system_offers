var express = require('express');
var router = express.Router();
var ERROR_CODE = require('../const/error_code');
var GroupOffers = require('../models/group_offers');
var OfferLives = require('../models/offer_lives');
var Users = require('../models/users');
var logger = require('../methods/winston');
const ROLE = require('../const/role_const');
var utils = require('../methods/utils');
var mongoose = require('mongoose');
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
    var gameId = req.query.gameId;
    GroupOffers.getModel(gameId).find({}).exec(function (error, offers) {
        if(error) {
            console.log(error);
            return next();
        }
        res.send({
            erroCode: ERROR_CODE.SUCCESS,
            data: offers
        });
        console.log("list offers " + JSON.stringify(offers));
    });
});

router.post('/create', function (req, res, next) {
    var gameId = req.query.gameId;
    var body = {
        nameOffer: req.body.nameOffer,
        durationCountDown: parseInt(req.body.durationCountDown),
        description: req.body.description,
        // type: parseInt(req.body.type),
        // value: parseInt(req.body.value),
        originalCost: parseInt(req.body.originalCost),
        promotionCost: parseInt(req.body.promotionCost),
        items: req.body.items
    };
    //
    // if(body.items == null) {
    //     body.items = [];
    //     body.items.push({
    //         type: body.type,
    //         value: body.value
    //     });
    // } 
    for(var i in body.items) {
        body.items[i].value = parseInt(body.items[i].value);
        body.items[i].type = parseInt(body.items[i].type);
    }
    GroupOffers.getModel(gameId).find({}).sort("-seq").select("seq").exec(function(err, raw) {
        console.log("create offer " + JSON.stringify(raw));
        var seq = 0;
        if(raw.length == 0) {

        }else{
            seq = raw[0].seq + 1;
        }
        GroupOffers.getModel(gameId).create({
            nameOffer: body.nameOffer,
            durationCountDown: body.durationCountDown,
            description: body.description,
            originalCost: body.originalCost,
            promotionCost: body.promotionCost,
            createAt: utils.TimeUtility.getCurrentTime(gameId),
            items: body.items,
            seq: seq
        }, function (error, offer) {
            if(error) {
                logger.getLogger(gameId).info("create offer error " + error);
                res.send({
                    errorCode: ERROR_CODE.FAIL
                });
                return;
            }
            res.send({
                errorCode: ERROR_CODE.SUCCESS,
                data: offer
            });
    
        });
    })
    
});

router.post('/delete', async function (req, res, next) {
    var gameId = req.query.gameId;
    var body = {
        idOffer: req.body.idOffer
    };
    GroupOffers.getModel(gameId).findByIdAndRemove(body.idOffer).exec(function (err) {
        if(err) {
            res.send({
                errorCode: ERROR_CODE.FAIL
            });
        }else{
            //find all offer live refer to self
            OfferLives.getModel(gameId).find({groupOffer: body.idOffer}).exec(async function (err, offerLives) {
                console.log('ref offer lives ' + JSON.stringify(offerLives));
                for await(let offerLive of offerLives) {
                    //notify to user
                    await Users.getModel(gameId).updateMany({groupObject: mongoose.Types.ObjectId(offerLive.groupObject)}, {isModifiedOffer: true}).exec(function (err, users) {
                        
                    });
                    //delete ref to group offer
                    offerLives.groupOffer = null;
                    await offerLive.save();
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
        idOffer: req.body.idOffer,
        dataModify: req.body.dataModify
    };
    if(body.dataModify.items == null) {
        body.dataModify.items = [];
        body.dataModify.items.push({
            type: body.dataModify.type,
            value: body.dataModify.value
        });
    }
    body.dataModify.createAt = utils.TimeUtility.getCurrentTime(gameId);
    GroupOffers.getModel(gameId).findOneAndUpdate({_id: body.idOffer}, body.dataModify, {new: true}).exec(function (err, raw) {
        if(err) {
            res.send({
                errorCode: ERROR_CODE.FAIL
            });
        }else{
            res.send({
                errorCode: ERROR_CODE.SUCCESS,
                data: raw
            });
            //find all offer live refer to self
            OfferLives.getModel(gameId).find({groupOffer: raw._id}).exec(function (err, offerLives) {
                for(var i in offerLives) {
                    //notify to user    
                    Users.getModel(gameId).updateMany({groupObject: mongoose.Types.ObjectId(offerLives[i].groupObject)}, {isModifiedOffer: true}, {new: true}).exec(function (err, user) {
                        console.log("edit group offers ref to ussers " + JSON.stringify(user));
                    });
                }
            });
        }
    });
});

router.get("/get_list_group_offer", function (req, res, next) {
    var gameId = req.query.gameId;
    GroupOffers.getModel(gameId).find({}).exec(function (err, groupOffers) {
        if(err) {
            res.send({
                errorCode: ERROR_CODE.FAIL,
                data: []
            });
            return;
        }
        var raws = [];
        for(var i in groupOffers) {
            raws.push({
                _id: groupOffers[i]._id,
                nameOffer: groupOffers[i].nameOffer,
                seq: groupOffers[i].seq
            });
        }
        res.send({
            errorCode: ERROR_CODE.SUCCESS,
            data: raws
        })
    });
});

module.exports = router;