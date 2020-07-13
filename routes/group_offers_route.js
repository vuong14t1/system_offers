var express = require('express');
var router = express.Router();
var ERROR_CODE = require('../const/error_code');
var GroupOffers = require('../models/group_offers');
var OfferLives = require('../models/offer_lives');
var Users = require('../models/users');
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
    var gameId = req.query.gameId;
    GroupOffers.getModel(gameId).find({}, function (error, offers) {
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
        durationLive: req.body.durationLive,
        durationCountDown: req.body.durationCountDown,
        description: req.body.description,
        type: req.body.type,
        value: req.body.value,
        originalCost: req.body.originalCost,
        promotionCost: req.body.promotionCost
    };
    GroupOffers.getModel(gameId).create({
        nameOffer: body.nameOffer,
        durationLive: body.durationLive,
        durationCountDown: body.durationCountDown,
        description: body.description,
        type: body.type,
        value: body.value,
        originalCost: body.originalCost,
        promotionCost: body.promotionCost
    }, function (error, offer) {
        if(error) {
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
});

router.post('/delete', function (req, res, next) {
    var gameId = req.query.gameId;
    var body = {
        idOffer: req.body.idOffer
    };
    GroupOffers.getModel(gameId).findByIdAndRemove(body.idOffer, function (err) {
        if(err) {
            res.send({
                errorCode: ERROR_CODE.FAIL
            });
        }else{
            //find all offer live refer to self
            OfferLives.getModel(gameId).find({groupOffer: body.idOffer}, function (err, offerLives) {
                console.log('ref offer lives ' + JSON.stringify(offerLives));
                for(var i in offerLives) {
                    //notify to user
                    Users.getModel(gameId).find({groupObject: offerLives[i].groupObject}, function (err, users) {
                        console.log('ref offer users ' + JSON.stringify(users));
                        for(var i in users) {
                            if(users[i]) {
                                users[i].isModifiedOffer = true;
                                users[i].save();
                            }
                        }
                    });
                    //delete ref to group offer
                    offerLives[i].groupOffer = null;
                    offerLives[i].save();
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
    GroupOffers.getModel(gameId).findOneAndUpdate({_id: body.idOffer}, body.dataModify, {new: true}, function (err, raw) {
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
            OfferLives.getModel(gameId).find({groupOffer: raw._id}, function (err, offerLives) {
                for(var i in offerLives) {
                    //notify to user
                    Users.find({groupObject: offerLives[i].groupObject}, function (err, user) {
                        user.isModifiedOffer = true;
                        user.save();
                    });
                }
            });
        }
    });
});
module.exports = router;