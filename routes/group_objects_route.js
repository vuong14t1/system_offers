var express = require('express');
var router = express.Router();
var ERROR_CODE = require('../const/error_code');
var GroupObjects = require('../models/group_objects');
var OfferLives = require('../models/offer_lives');
var Users = require('../models/users');
var CHANNEL_PAYMENT = require('../const/channel_const');
var utils = require('../methods/utils');
const ROLE = require('../const/role_const');
const { raw } = require('body-parser');
require('../models/offer_lives');

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
	console.log('Time 111: ', Date.now())
    if(!req.session.loggedIn) {
        res.send({
            errorCode: ERROR_CODE.NOT_LOGIN
        });
        return;
    }
    next()
})

router.use('/set_name',function timeLog (req, res, next) {
    console.log('Time: ', Date.now())
    if(req.session.role == ROLE.VIEWER) {
        res.send({
            errorCode: ERROR_CODE.NOT_PERMISSION
        });
        return;
    }
    next()
})

router.use('/create',function timeLog (req, res, next) {
    console.log('Time: ', Date.now())
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
    GroupObjects.getModel(gameId).find({}).exec(function (error, objects) {
        if(error) {
            console.log("====", error);
            return next();
		}
		res.send({
			errorCode: ERROR_CODE.SUCCESS,
            data: objects
        });
        console.log("list object " + JSON.stringify(objects));
    });
    
});

router.post('/create', function (req, res, next) {
    var gameId = req.query.gameId;
    var body = {
        totalGame: req.body.totalGame,
        channelPayment: req.body.channelPayment,
        totalCost: req.body.totalCost,
        numberPay: req.body.numberPay,
        lastPaidPack: req.body.lastPaidPack,
        age: req.body.age,
        timeLastOnline: req.body.timeLastOnline,
        channelGame: req.body.channelGame
	};
	var channel = CHANNEL_PAYMENT[gameId][body.channelPayment + ''];
	console.log("create " , channel);

    var timeMinAge = utils.TimeUtility.getCurrentTime(gameId) - body.age.to;
    var timeMaxAge = utils.TimeUtility.getCurrentTime(gameId) - body.age.from;
    var timeMinOnline = utils.TimeUtility.getCurrentTime(gameId) - body.timeLastOnline.to;
    var timeMaxOnline = utils.TimeUtility.getCurrentTime(gameId) - body.timeLastOnline.from;
    console.log("current time " + utils.TimeUtility.getCurrentTime() + "|min age" + timeMinAge + "| max age " + timeMaxAge);
    console.log("current time " + utils.TimeUtility.getCurrentTime() + "|min online" + timeMinOnline + "| max online " + timeMaxOnline);


	Users.getModel(gameId).find({})
    // .where('groupObject').equals(null)
    .where('totalGame').gte(body.totalGame.from).lte(body.totalGame.to)
    .where('channelGame').gte(body.channelGame.from).lte(body.channelGame.to)
    .where("channelPayment." + channel + ".cost").gte(body.totalCost.from).lte(body.totalCost.to)
    .where("channelPayment." + channel + ".number").gte(body.numberPay.from).lte(body.numberPay.to)
    .where('lastPaidPack').gte(body.lastPaidPack.from).lte(body.lastPaidPack.to)
    .where('timeCreateAccount').gte(timeMinAge).lte(timeMaxAge)
    .where('lastTimeOnline').gte(timeMinOnline).lte(timeMaxOnline)
    .exec(async function(error, users){
        console.log('============ res ' + JSON.stringify(users));
        if(users.length <= 0) {
            res.send({erroCode: ERROR_CODE.EMPTY});
            return;
        }
        GroupObjects.getModel(gameId).create({
            totalUser: users.length,
            totalGame: {
                from: body.totalGame.from,
                to: body.totalGame.to
            },
            channelPayment: body.channelPayment,
            totalCost: {
                from: body.totalCost.from,
                to: body.totalCost.to
,
            },
            numberPay: {
                from: body.numberPay.from,
                to: body.numberPay.to
            },
            lastPaidPack: {
                from: body.lastPaidPack.from,
                to: body.lastPaidPack.to
            },

            age: {
                from: body.age.from,
                to: body.age.to
            },
            timeLastOnline: {
                from: body.timeLastOnline.from,
                to: body.timeLastOnline.to
            },

            channelGame: {
                from: body.channelGame.from,
                to: body.channelGame.to
            }
        }, async function (error, groupObject) {
            if(error) {
                console.log("create group object fail");
                res.send({errorCode: ERROR_CODE.FAIL});
            }else{
                console.log("create group object success");
                for(var i in users) {
                    users[i].groupObject = groupObject._id;
                    await users[i].save(function (error, data) {
                        if(error) {
                            console.log("update user in group object fail!");
                        }else{
                            console.log("update user in group object success!");
                        }
                    });
                }
                res.send({
                    errorCode: ERROR_CODE.SUCCESS,
                    data: groupObject,
                    dataUser: users
                });
            }
        });
    });
});

router.post('/set_name', function (req, res, next) {
    var gameId = req.query.gameId;
    var body = {
        idGroupObject: req.body.idGroupObject,
        nameObject: req.body.nameObject
    };
    GroupObjects.getModel(gameId).findByIdAndUpdate(body.idGroupObject, {nameObject: body.nameObject}, {new: true}, function (err, groupObject) {
        if(err) {
            res.send({errorCode: ERROR_CODE.FAIL});
            return;
        }
        if(groupObject == null) {
            res.send({errorCode: ERROR_CODE.NOT_FOUND});
            return;
        }
        res.send({errorCode: ERROR_CODE.SUCCESS, data: groupObject});
    });
});

router.post('/edit', async function (req, res, next) {
    var gameId = req.query.gameId;
    var body = {
        idGroupObject: req.body.idGroupObject,
        dataModify: req.body.dataModify
    };
    
    await GroupObjects.getModel(gameId).findByIdAndUpdate(body.idGroupObject, body.dataModify, {new: true}, async function (err, groupObject) {
        if(err) {
            res.send({errorCode: ERROR_CODE.FAIL});
            return;
        }
        if(groupObject == null) {
            res.send({errorCode: ERROR_CODE.NOT_FOUND});
            return;
        }
        var users = await Users.getModel(gameId).find({groupObject: body.idGroupObject}, async function(err, users){
        
        });
        for await (let user of users) {
            if(user) {
                user.groupObject = null;
                await user.save();
            }
        }

        console.log("data group " + JSON.stringify(groupObject));
        var channel = CHANNEL_PAYMENT[groupObject.channelPayment + ''];
        var timeMinAge = utils.TimeUtility.getCurrentTime(gameId) - groupObject.age.to;
        var timeMaxAge = utils.TimeUtility.getCurrentTime(gameId) - groupObject.age.from;
        var timeMinOnline = utils.TimeUtility.getCurrentTime(gameId) - groupObject.timeLastOnline.to;
        var timeMaxOnline = utils.TimeUtility.getCurrentTime(gameId) - groupObject.timeLastOnline.from;
        
        await Users.getModel(gameId).find({})
        .where('groupObject').exists(false)
        .where('totalGame').gte(groupObject.totalGame.from).lte(groupObject.totalGame.to)
        .where('channelGame').gte(groupObject.channelGame.from).lte(groupObject.channelGame.to)
        .where("channelPayment." + channel + ".cost").gte(groupObject.totalCost.from).lte(groupObject.totalCost.to)
        .where("channelPayment." + channel + ".number").gte(groupObject.numberPay.from).lte(groupObject.numberPay.to)
        .where('lastPaidPack').gte(groupObject.lastPaidPack.from).lte(groupObject.lastPaidPack.to)
        .where('timeCreateAccount').gte(timeMinAge).lte(timeMaxAge)
        .where('lastTimeOnline').gte(timeMinOnline).lte(timeMaxOnline)
        .exec(async function (err, usersAfters) {
            groupObject.totalUser = usersAfters.length;
            await groupObject.save();
            for await (let user of usersAfters) {
                if(user) {
                    user.groupObject = groupObject._id;
                    user.save();
                }
            }
            res.send({
                errorCode: ERROR_CODE.SUCCESS,
                data: groupObject
            });
        })
        
    });
});

router.post('/delete', async function (req, res, next) {
    var gameId = req.query.gameId;
    var body = {
        idGroupObject: req.body.idGroupObject
    };
    var users = await Users.getModel(gameId).find({groupObject: body.idGroupObject}, async function(err, users){
        
    });
    for await (let user of users) {
        if(user) {
            user.groupObject = null;
            user.isModified = true;
            await user.save();
        }
    }
    await GroupObjects.getModel(gameId).findByIdAndRemove(body.idGroupObject, function (err, raw) {
        
    });
    await OfferLives.getModel(gameId).find({groupObject: body.idGroupObject}, function (err, raws) {
        for(var i in raws) {
            raws[i].groupObject = null;
        }
    });
    res.send({
        erroCode: ERROR_CODE.SUCCESS
    });
});

router.get('/list_user', function (req, res, next) {
    var gameId = req.query.gameId;
    var body = {
        idGroupObject: req.body.idGroupObject,
        indexPage: req.body.indexPage
    };
    if(body.indexPage == null) {
        body.indexPage = 0;
    }
    var numberOfPage = 10;
    Users.getModel(gameId).find({groupObject: body.idGroupObject}).skip(body.indexPage * numberOfPage).exec(function (err, users) {
        if(err) return res.send({errorCode: ERROR_CODE.FAIL});
        res.send({errorCode: ERROR_CODE.SUCCESS, data: users});
    });
});
module.exports = router;