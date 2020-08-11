var express = require('express');
var router = express.Router();
var Users = require('../models/users');
var GroupObjects = require('../models/group_objects');
var GroupOffers = require('../models/group_offers');
var OfferLives = require('../models/offer_lives');
var ERROR_CODE = require('../const/error_code');
var CHANNEL_PAYMENT = require('../const/channel_const');
var utils = require('../methods/utils');
router.get('/user_login', async function (req, res, next) {
    var gameId = req.query.gameId;
    console.log("post user login " + gameId);
    var body = {
        userId: req.query.userId,
        timeCreateAccount: req.query.timeCreateAccount,
        lastTimeOnline: req.query.lastTimeOnline,
        channelGame: req.query.channelGame,
        timeServer: req.query.timeServer
    };
    utils.TimeUtility.setCurrentServerTime(gameId, body.timeServer);
    await Users.getModel(gameId).findOne({
        userId: body.userId
    }).exec(async function (error, user) {
        if (error) return next(error);
        if (user != null) {
            user.lastTimeOnline = body.lastTimeOnline;
            user.timeCreateAccount = body.timeCreateAccount;
            user.channelGame = body.channelGame;
            user.save(function (error, user) {
                if (error) {
                    console.log('post update user login error');
                    res.send({
                        erroCode: ERROR_CODE.FAIL
                    });
                } else {
                    console.log('user exist' + JSON.stringify(user));
                    res.send({
                        erroCode: ERROR_CODE.SUCCESS
                    });
                }
            });
        } else {
            await Users.getModel(gameId).create({
                userId: body.userId,
                timeCreateAccount: body.timeCreateAccount,
                lastTimeOnline: body.lastTimeOnline,
                channelGame: body.channelGame
            }, function (error, user) {
                if (error) {
                    console.log('post user login error');
                    res.send({
                        erroCode: ERROR_CODE.FAIL
                    });
                } else {
                    res.send({
                        erroCode: ERROR_CODE.SUCCESS
                    });
                }
            });
        }

    });

});

router.get('/stats_game', async function (req, res, next) {
    var gameId = req.query.gameId;
    var body = {
        userId: req.query.userId,
        totalGame: req.query.totalGame,
        channelGame: req.query.channelGame,
        timeServer: req.query.timeServer
    };
    utils.TimeUtility.setCurrentServerTime(gameId, body.timeServer);
    await Users.getModel(gameId).findOneAndUpdate({
        userId: body.userId
    }, {
        totalGame: body.totalGame,
        channelGame: body.channelGame
    }).exec(async function (error, user) {
        if (error) {
            console.log('post user login error');
            res.send({
                erroCode: ERROR_CODE.FAIL
            });
        } else {
            console.log('post user login success: ' + JSON.stringify(user));
            res.send({
                erroCode: ERROR_CODE.SUCCESS
            });
        }
    });
});

router.get('/lastPayment', function (req, res, next) {
    var gameId = req.query.gameId;
    var body = {
        userId: req.query.userId,
        lastPaidPack: req.query.lastPaidPack,
        channelPayment: req.query.channelPayment,
        timeServer: req.query.timeServer
    };
    utils.TimeUtility.setCurrentServerTime(gameId, timeServer);
    Users.getModel(gameId).findOne({
        userId: body.userId
    }, function (error, user) {
        if (user != null) {
            user.lastPaidPack = body.lastPaidPack;
            var channel = CHANNEL_PAYMENT[body.channelPayment + ''];
            if (user.channelPayment[channel] != null) {
                user.channelPayment[channel].cost += body.lastPaidPack;
                user.channelPayment[channel].number += 1;
            } else {
                user.channelPayment.splice(channel, 1, {
                    channel: body.channelPayment,
                    cost: body.lastPaidPack,
                    number: 1
                });
            }
            console.log('after save ' + JSON.stringify(user));
            user.save(function (error, user) {
                console.log('==== ' + error);
                if (error) {
                    res.send({
                        erroCode: ERROR_CODE.FAIL
                    });
                } else {
                    res.send({
                        erroCode: ERROR_CODE.SUCCESS
                    });
                }
            });
        }
    });
});

router.get('/get_offer', async function (req, res, next) {
    var gameId = req.query.gameId;
    var body = {
        userId: req.query.userId
    };
    var user = await Users.getModel(gameId).findOne({
        userId: body.userId
    });
    console.log("vao day get offer " + JSON.stringify(user));
    if (user == null) {
        res.send({
            errorCode: ERROR_CODE.NOT_CHANGE
        });
        return;
    }
    console.log("get_offer " + JSON.stringify(user));
    try {
        if (user != null) {
            if (user.isModifiedOffer) {
                // user.isModifiedOffer = false;
                // await user.save();
                //TH user khong nam trong group nao ca
                if (user.groupObject != null && user.groupObject.length > 0) {
                    var data = [];
                    for await (const offerLive of OfferLives.getModel(gameId).findOne({
                        groupObject: {
                            $in: user.groupObject
                        }
                    }).populate("groupObject").populate("groupOffer")) {
                        console.log("find offer by group " + JSON.stringify(offerLive));
                        if (offerLive != null) {
                            if (utils.TimeUtility.getCurrentTime(gameId) > offerLive.timeFinish) {
                                continue;
                            }
                            var offerRes = {
                                idOfferLive: offerLive._id,
                                nameOffer: offerLive.groupOffer.nameOffer,
                                durationCountDown: offerLive.groupOffer.durationCountDown,
                                description: offerLive.groupOffer.description,
                                type: offerLive.groupOffer.type,
                                value: offerLive.groupOffer.value,
                                originalCost: offerLive.groupOffer.originalCost,
                                promotionCost: offerLive.groupOffer.promotionCost,
                                timeStart: offerLive.timeStart,
                                timeFinish: offerLive.timeFinish
                            };
                            data.push(offerRes);
                        }
                    }
                    console.log("get offer res " + JSON.stringify(data));
                    if (data.length > 0) {
                        res.send({
                            errorCode: ERROR_CODE.SUCCESS,
                            data: data
                        });
                    } else {
                        res.send({
                            errorCode: ERROR_CODE.EMPTY
                        });
                    }

                    // GroupObjects.getModel(gameId).findOne({_id: user.groupObject}).populate("offerLive").exec(async function (err, groupObject) {
                    //     console.log("get offer " + JSON.stringify(groupObject.offerLive));
                    //     //TH user offer live bi xoa
                    //     if(groupObject != null && groupObject.offerLive != null) {
                    //         var idOffer = groupObject.offerLive.groupOffer;
                    //         console.log("id offer " + idOffer);
                    //         if(idOffer != null) {
                    //             await GroupOffers.getModel(gameId).findOne({_id: idOffer}, async function (err, groupOffer) {
                    //                 if(err) {
                    //                     res.send({
                    //                         errorCode: ERROR_CODE.FAIL
                    //                     });
                    //                     return;
                    //                 }
                    //                 res.send({
                    //                     "errorCode": ERROR_CODE.SUCCESS,
                    //                     "idOfferLive": groupObject.offerLive._id,
                    //                     "nameOffer": groupOffer.nameOffer,
                    //                     "durationCountDown": groupOffer.durationCountDown,
                    //                     "description": groupOffer.description,
                    //                     "type": groupOffer.type,
                    //                     "value": groupOffer.value,
                    //                     "originalCost": groupOffer.originalCost,
                    //                     "promotionCost": groupOffer.promotionCost,
                    //                     "timeStart": groupObject.offerLive.timeStart,
                    //                     "timeFinish": groupObject.offerLive.timeFinish
                    //                 });

                    //             });
                    //             //increase tracking total user received offer
                    //             OfferLives.getModel(gameId).findOne({_id: groupObject.offerLive._id}, function (err, offerLive){
                    //                 if(offerLive) {
                    //                     offerLive.totalReceived += 1;
                    //                     offerLive.save();
                    //                 }
                    //             })
                    //         }else{
                    //             res.send({
                    //                 errorCode: ERROR_CODE.EMPTY
                    //             });
                    //         }
                    //     }else{
                    //         res.send({
                    //             errorCode: ERROR_CODE.EMPTY
                    //         });
                    //     }
                    // });
                } else {
                    res.send({
                        errorCode: ERROR_CODE.EMPTY
                    });
                }
            } else {
                //TH group da bi xoa
                if (user.groupObject == null || user.groupObject.length <= 0) {
                    res.send({
                        errorCode: ERROR_CODE.EMPTY
                    });
                } else {
                    res.send({
                        errorCode: ERROR_CODE.NOT_CHANGE
                    });
                }
            }
        }
    } catch (err) {
        console.log(err);
        res.send({
            errorCode: ERROR_CODE.FAIL
        });
        return;
    }

});

router.get('/search_detail_user', function (req, res, next) {
    var gameId = req.query.gameId;
    var body = {
        userId: req.query.userId
    };
    Users.getModel(gameId).findOne({
        userId: body.userId
    }, function (err, raw) {
        if (err) {
            return res.send({
                errorCode: ERROR_CODE.FAIL
            });
        }
        if (raw.groupObject != null) {
            OfferLives.getModel(gameId).findOne({
                groupObject: raw.groupObject
            }).populate('groupObject').populate('groupOffer').exec(function (err, raw1) {
                return res.send({
                    errorCode: ERROR_CODE.SUCCESS,
                    data: raw1
                });
            });
        } else {
            return res.send({
                errorCode: ERROR_CODE.SUCCESS,
                data: null
            });
        }
    });
});

router.get('/search_user', function (req, res, next) {
    var gameId = req.query.gameId;
    var body = {
        userId: req.query.userId
    };
    Users.getModel(gameId).findOne({
        userId: body.userId
    }).populate('groupObject').populate('groupOffer').exec(function (err, data) {
        if (err) {
            return res.send({
                errorCode: ERROR_CODE.FAIL
            });

        }
        return res.send({
            errorCode: ERROR_CODE.SUCCESS,
            data: data
        });
    });
});

router.get("/search_user_by_group", function (req, res, next) {
    var gameId = req.query.gameId;
    var body = {
        userId: req.query.userId,
        groupObject: req.query.groupObject
    };
    Users.getModel(gameId).findOne({
        userId: body.userId,
        groupObject: body.groupObject
    }, function (err, raw) {
        if (err) {
            return res.send({
                errorCode: ERROR_CODE.FAIL
            });
        }
        res.send({
            errorCode: ERROR_CODE.SUCCESS,
            data: raw
        });
    });
});

router.post("/edit_user", function (req, res, next) {
    var gameId = req.query.gameId;
    var body = {
        idUser: req.body._id,
        dataModify: req.body.dataModify
    };
    Users.getModel(gameId).findOneAndUpdate({
        userId: body.dataModify.userId
    }, body.dataModify, {
        new: false
    }, function (err, user) {
        if (err) {
            res.send({
                errorCode: ERROR_CODE.FAIL
            });
            return;
        }
        if (user == null) {
            res.send({
                errorCode: ERROR_CODE.NOT_FOUND
            });
            return;
        }
        res.send({
            errorCode: ERROR_CODE.SUCCESS,
            data: user
        })

    })
});

router.post("/import_data_user", async function (req, res, next) {
    var gameId = req.query.gameId;
    if (req.files == null) {
        res.send({
            errorCode: ERROR_CODE.NOT_FOUND
        });
        return
    }
    var fileData = req.files.file;
    console.log("=file ", fileData)
    var xlsx = require('node-xlsx');
    var obj = xlsx.parse(fileData.data)[0].data // parses a file
    var checkSuccess = 0;
    var checkFail = 0;
    for (let i = 1; i < obj.length; i++) {
        let channelPayment = [];
        let detaiChannelPayment = obj[i][1].split('-');
        for (let j in detaiChannelPayment) {
            let detaiChannelPayment1 = detaiChannelPayment[j].split('|');
            let data = {
                channel: detaiChannelPayment1[0],
                cost: detaiChannelPayment1[1],
                number: detaiChannelPayment1[2],
            }
            channelPayment.push(data);
        }
        let userData = {
            userId: obj[i][0],
            totalGame: obj[i][2],
            lastPaidPack: obj[i][3],
            timeCreateAccount: utils.TimeUtility.getCurrentTime(gameId) - parseInt(obj[i][4]) * 86400,
            lastTimeOnline: utils.TimeUtility.getCurrentTime(gameId) - parseInt(obj[i][5]) * 86400,
            isModifiedOffer: obj[i][6],
            channelGame: obj[i][7],
            channelPayment: channelPayment
        }
        await Users.getModel(gameId).findOneAndUpdate({userId: userData.userId},
             userData, {upsert: true, new: true, runValidators: true}).exec(function(err, user){
            if(err){
                checkFail++;
            }
            if(user){
                checkSuccess++;
            }
        })
    }

    setTimeout(function(){
        res.send({
            errorCode: ERROR_CODE.SUCCESS,
            data: {
                checkFail: checkFail,
                checkSuccess: checkSuccess
            }
        })
    }.bind(this), 2000)
});
module.exports = router;