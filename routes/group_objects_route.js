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

router.use(['/create', '/delete', '/edit'],function timeLog (req, res, next) {
    if(req.session.role == ROLE.VIEWER) {
        res.send({
            errorCode: ERROR_CODE.NOT_PERMISSION
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
    GroupObjects.getModel(gameId).find({}).populate("offerLive").exec(function (error, objects) {
        if(error) {
            console.log("====", error);
            return next();
		}
		res.send({
			errorCode: ERROR_CODE.SUCCESS,
            data: objects
        });
    });
    
});

router.post('/create', async function (req, res, next) {
    var gameId = req.query.gameId;
    console.log("create ==== current time ====", utils.TimeUtility.getCurrentTime(gameId));
    var body = {
        totalGame: req.body.totalGame,
        channelPayment: req.body.channelPayment,
        totalCost: req.body.totalCost,
        numberPay: req.body.numberPay,
        lastPaidPack: req.body.lastPaidPack,
        age: req.body.age,
        timeLastOnline: req.body.timeLastOnline,
        channelGame: req.body.channelGame,
        nameObject: req.body.nameObject
    };
	var channel = CHANNEL_PAYMENT[gameId][body.channelPayment + ''];
    var timeMinAge = utils.TimeUtility.getCurrentTime(gameId) - body.age.to;
    var timeMaxAge = utils.TimeUtility.getCurrentTime(gameId) - body.age.from;
    var timeMinOnline = utils.TimeUtility.getCurrentTime(gameId) - body.timeLastOnline.to;
    var timeMaxOnline = utils.TimeUtility.getCurrentTime(gameId) - body.timeLastOnline.from;
    console.log("current time " + utils.TimeUtility.getCurrentTime() + "|min age" + timeMinAge + "| max age " + timeMaxAge);
    console.log("current time " + utils.TimeUtility.getCurrentTime() + "|min online" + timeMinOnline + "| max online " + timeMaxOnline);
    var groupObject = await GroupObjects.getModel(gameId).create({
        totalUser: 0,
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
        },

        nameObject: body.nameObject,
        
        createAt: utils.TimeUtility.getCurrentTime(gameId)

    }, function (error, groupObject) {
        if(error) {
            res.send({errorCode: ERROR_CODE.FAIL});
        }else{
            Users.getModel(gameId).updateMany({}, {groupObject: groupObject._id}, {new: true}, async function(err, raws){
                console.log("====================== 1 " + err);
                console.log('============ 2 ' + JSON.stringify(raws));
                if(raws.ok == 1) {
                    groupObject.totalUser = raws.nModified;
                    await groupObject.save();
                    console.log("vao day di ne");
                    res.send({
                        errorCode: ERROR_CODE.SUCCESS,
                        data: groupObject,
                        dataUser: []
                    }); 
                }else{
                    res.send({
                        errorCode: ERROR_CODE.FAIL
                    });
                }
                
            })
            .where('groupObject').equals(null)
            .where('totalGame').gte(body.totalGame.from).lte(body.totalGame.to)
            .where('channelGame').gte(body.channelGame.from).lte(body.channelGame.to)
            .where("channelPayment." + channel + ".cost").gte(body.totalCost.from).lte(body.totalCost.to)
            .where("channelPayment." + channel + ".number").gte(body.numberPay.from).lte(body.numberPay.to)
            .where('lastPaidPack').gte(body.lastPaidPack.from).lte(body.lastPaidPack.to)
            .where('timeCreateAccount').gte(timeMinAge).lte(timeMaxAge)
            .where('lastTimeOnline').gte(timeMinOnline).lte(timeMaxOnline)
        }
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
        await Users.getModel(gameId).updateMany({groupObject: body.idGroupObject}, {groupObject: null}, async function(err, users){
        
        });

        console.log("data group " + JSON.stringify(groupObject));
        var channel = CHANNEL_PAYMENT[gameId][groupObject.channelPayment + ''];
        var timeMinAge = utils.TimeUtility.getCurrentTime(gameId) - groupObject.age.to;
        var timeMaxAge = utils.TimeUtility.getCurrentTime(gameId) - groupObject.age.from;
        var timeMinOnline = utils.TimeUtility.getCurrentTime(gameId) - groupObject.timeLastOnline.to;
        var timeMaxOnline = utils.TimeUtility.getCurrentTime(gameId) - groupObject.timeLastOnline.from;
        
        await Users.getModel(gameId).updateMany({}, {groupObject: groupObject._id})
        .where('groupObject').equals(null)
        .where('totalGame').gte(groupObject.totalGame.from).lte(groupObject.totalGame.to)
        .where('channelGame').gte(groupObject.channelGame.from).lte(groupObject.channelGame.to)
        .where("channelPayment." + channel + ".cost").gte(groupObject.totalCost.from).lte(groupObject.totalCost.to)
        .where("channelPayment." + channel + ".number").gte(groupObject.numberPay.from).lte(groupObject.numberPay.to)
        .where('lastPaidPack').gte(groupObject.lastPaidPack.from).lte(groupObject.lastPaidPack.to)
        .where('timeCreateAccount').gte(timeMinAge).lte(timeMaxAge)
        .where('lastTimeOnline').gte(timeMinOnline).lte(timeMaxOnline)
        .exec(async function (err, raws) {
            if(raws.ok == 1) {
                // console.log("usersAfters ===", usersAfters);
                groupObject.totalUser = raws.nModified;
                await groupObject.save();
                console.log("groupObject.totalUser == ", groupObject.totalUser);
                res.send({
                    errorCode: ERROR_CODE.SUCCESS,
                    data: groupObject
                });
            }else{
                res.send({
                    errorCode: ERROR_CODE.FAIL
                });
            }
            
        })
        
    });
});

router.post('/delete', async function (req, res, next) {
    var gameId = req.query.gameId;
    var body = {
        idGroupObject: req.body.idGroupObject
    };
    await Users.getModel(gameId).updateMany({groupObject: body.idGroupObject}, {groupObject: null, isModified: true}, async function(err, users){
        
    });
    await GroupObjects.getModel(gameId).findByIdAndRemove(body.idGroupObject, function (err, raw) {
        
    });
    await OfferLives.getModel(gameId).updateMany({groupObject: body.idGroupObject}, {groupObject: null}, {new: true}, function (err, raws) {
        
    });
    res.send({
        errorCode: ERROR_CODE.SUCCESS
    });
});

router.get('/list_user', function (req, res, next) {
    var gameId = req.query.gameId;
    var idGroupObject = req.query.idGroupObject;
    var indexPage = req.query.indexPage;
    if(indexPage == null) {
        indexPage = 0;
    }
    var numberOfPage = 10;
    console.log("numberOfPage ", numberOfPage , "indexPage ", indexPage);
    Users.getModel(gameId).find({groupObject: idGroupObject}).skip(indexPage * numberOfPage).limit(numberOfPage).exec(function (err, users) {
        if(err) return res.send({errorCode: ERROR_CODE.FAIL});
        if(users.length > 0){
            res.send({errorCode: ERROR_CODE.SUCCESS, data: users});
        }else{
            res.send({errorCode: ERROR_CODE.EMPTY});
        }
    });
});

router.get('/get_list_group_object',async function (req, res, next) {
    var gameId = req.query.gameId;
    await GroupObjects.getModel(gameId).find({}).where("totalUser").gt(0).where("offerLive").equals(null).exec(async function (err, groupObjects) {
        console.log("get_list_group_object ", groupObjects);
        if(err) {
            res.send({
                errorCode: ERROR_CODE.FAIL,
                data: []
            });
            return;
        };
        console.log("get_list_group_object" + JSON.stringify(groupObjects));
        var raws = [];
        for(var i in groupObjects) {
            raws.push({
                _id: groupObjects[i]._id,
                nameObject: groupObjects[i].nameObject
            });
        }
        res.send({
            errorCode: ERROR_CODE.SUCCESS,
            data: raws
        });
    });
});
module.exports = router;