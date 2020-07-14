var express = require('express');
var router = express.Router();
var Users = require('../models/users');
var GroupObjects = require('../models/group_objects');
var GroupOffers = require('../models/group_offers');
var ERROR_CODE = require('../const/error_code');
var CHANNEL_PAYMENT = require('../const/channel_const');
router.get('/user_login', function (req, res, next) {
    var gameId = req.query.gameId;
    console.log("post user login " + gameId);
    var body = {
        userId: req.query.userId,
        timeCreateAccount: req.query.timeCreateAccount,
        lastTimeOnline: req.query.lastTimeOnline,
        channelGame: req.query.channelGame
    };
    Users.getModel(gameId).findOne({userId: body.userId}, function(error, user){
        if(error) return next(error);
        if(user != null) {        
            user.lastTimeOnline = body.lastTimeOnline;
            user.timeCreateAccount = body.timeCreateAccount;
            user.channelGame = body.channelGame;
            user.save(function (error, user) {
                if(error) {
                    console.log('post update user login error');
                    res.send({erroCode: ERROR_CODE.FAIL});
                }else{
                    console.log('post update user login success: ' + JSON.stringify(user));
                    res.send({erroCode: ERROR_CODE.SUCCESS});
                }
            });
        }else{
            Users.getModel(gameId).create({
                userId: body.userId,
                timeCreateAccount: body.timeCreateAccount,
                lastTimeOnline: body.lastTimeOnline,
                channelGame: body.channelGame
            }, function (error, user) {
                if(error) {
                    console.log('post user login error');
                    res.send({erroCode: ERROR_CODE.FAIL});
                }else{
                    console.log('post user login success: ' + JSON.stringify(user));
                    res.send({erroCode: ERROR_CODE.SUCCESS});
                }
            });
        }

    });
    
});

router.get('/stats_game', function (req, res, next) {
    var gameId = req.query.gameId;
    var body = {
        userId: req.query.userId,
        totalGame: req.query.totalGame,
        channelGame: req.query.channelGame
    };
    Users.getModel(gameId).findOne({userId: body.userId}, function (error, user) {
        if(user != null) {
            user.totalGame = body.totalGame;
            user.channelGame = body.channelGame;
            user.save(function (error, user) {
                if(error) {
                    res.send({erroCode: ERROR_CODE.FAIL});
                }else{
                    res.send({erroCode: ERROR_CODE.SUCCESS});
                }
            });
        }else{
            Users.getModel(gameId).create({userId: body.userId, totalGame: body.totalGame, channelGame: body.channelGame}, function(error, user) {
                if(error) {
                    console.log('post user login error');
                    res.send({erroCode: ERROR_CODE.FAIL});
                }else{
                    console.log('post user login success: ' + JSON.stringify(user));
                    res.send({erroCode: ERROR_CODE.SUCCESS});
                }
            });
        }
    });
});

router.get('/lastPayment', function(req, res, next){
    var gameId = req.query.gameId;
    var body = {
        userId: req.query.userId,
        lastPaidPack: req.query.lastPaidPack,
        channelPayment: req.query.channelPayment
    };
    Users.getModel(gameId).findOne({userId: body.userId}, function (error, user) {
        if(user != null) {
            user.lastPaidPack = body.lastPaidPack;
            var channel = CHANNEL_PAYMENT[body.channelPayment + ''];
            if(user.channelPayment[channel] != null) {
                user.channelPayment[channel].cost += body.lastPaidPack;
                user.channelPayment[channel].number += 1;
            }else{
                user.channelPayment.splice(channel, 1, {
                    channel: body.channelPayment,
                    cost: body.lastPaidPack,
                    number: 1
                });
            }
            console.log('after save ' + JSON.stringify(user));
            user.save(function (error, user) {
                console.log('==== ' + error);
                if(error) {
                    res.send({erroCode: ERROR_CODE.FAIL});
                }else{
                    res.send({erroCode: ERROR_CODE.SUCCESS});
                }
            });
        }else{
            Users.getModel(gameId).create({userId: body.userId, lastPaidPack: body.lastPaidPack, channelPayment: [{channel: body.channelPayment, cost: body.lastPaidPack}]}, function(error, user) {
                if(error) {
                    console.log('post user login error');
                    res.send({erroCode: ERROR_CODE.FAIL});
                }else{
                    console.log('post user login success: ' + JSON.stringify(user));
                    res.send({erroCode: ERROR_CODE.SUCCESS});
                }
            });
        }
    });
});

router.get('/get_offer', async function (req, res, next){
    var gameId = req.query.gameId;
    var body = {
        userId: req.query.userId
    };
    var user = await Users.getModel(gameId).findOne({userId: body.userId}, function (err, user) {

    });
    console.log("abc " + JSON.stringify(user));
    if(user != null) {
        if(user.isModifiedOffer) {
            if(user.groupObject != null) {
                GroupObjects.getModel(gameId).findOne({_id: user.groupObject}).populate("offerLive").exec(async function (err, groupObject) {
                    console.log("get offer " + JSON.stringify(groupObject.offerLive));
                    if(groupObject != null && groupObject.offerLive != null) {
                        var idOffer = groupObject.offerLive.groupOffer;
                        if(idOffer != null) {
                            await GroupOffers.getModel(gameId).findOne({_id: idOffer}, async function (err, groupOffer) {
                                if(err) {
                                    res.send({
                                        errorCode: ERROR_CODE.FAIL
                                    });
                                    return;
                                }
                                res.send({
                                    "errorCode": ERROR_CODE.SUCCESS,
                                    "nameOffer": groupOffer.nameOffer,
                                    "durationLive": groupOffer.durationLive,
                                    "durationCountDown": groupOffer.durationCountDown,
                                    "description": groupOffer.description,
                                    "type": groupOffer.type,
                                    "value": groupOffer.value,
                                    "originalCost": groupOffer.originalCost,
                                    "promotionCost": groupOffer.promotionCost,
                                    "timeStart": groupObject.offerLive.timeStart,
                                    "timeFinish": groupObject.offerLive.timeFinish
                                });
                                user.isModifiedOffer = false;
                                await user.save();
                            });
                        }else{
                            res.send({
                                errorCode: ERROR_CODE.EMPTY
                            });
                        }
                    }
                });
            }else{
                res.send({
                    errorCode: ERROR_CODE.EMPTY
                });
            }
        }else{
            res.send({
                errorCode: ERROR_CODE.NOT_CHANGE
            });
        }
    }
});
module.exports = router;