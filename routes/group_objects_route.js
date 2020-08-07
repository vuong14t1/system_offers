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
var mongoose = require('mongoose');
var logger = require('../methods/winston');
var _ = require('lodash');

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
    let body = {
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
    let bodyQuery = _.cloneDeep(body);
    var INFINITY = 9999999999;
    //check value data
    if(bodyQuery.totalGame.from == null){
        bodyQuery.totalGame.from = 0;
    }
    if(bodyQuery.totalGame.to == null){
        bodyQuery.totalGame.to = INFINITY;
    }

    if(bodyQuery.totalCost.from == null){
        bodyQuery.totalCost.from = 0;
    }
    if(bodyQuery.totalCost.to == null){
        bodyQuery.totalCost.to = INFINITY;
    }

    if(bodyQuery.numberPay.from == null){
        bodyQuery.numberPay.from = 0;
    }
    if(bodyQuery.numberPay.to == null){
        bodyQuery.numberPay.to = INFINITY;
    }

    if(bodyQuery.lastPaidPack.from == null){
        bodyQuery.lastPaidPack.from = 0;
    }
    if(bodyQuery.lastPaidPack.to == null){
        bodyQuery.lastPaidPack.to = INFINITY;
    }

    if(bodyQuery.age.from == null){
        bodyQuery.age.from = 0;
    }
    if(bodyQuery.age.to == null){
        bodyQuery.age.to = utils.TimeUtility.getCurrentTime(gameId);
    }

    if(bodyQuery.timeLastOnline.from == null){
        bodyQuery.timeLastOnline.from = 0;
    }
    if(bodyQuery.timeLastOnline.to == null){
        bodyQuery.timeLastOnline.to = utils.TimeUtility.getCurrentTime(gameId);
    }

    if(bodyQuery.channelGame.from == null){
        bodyQuery.channelGame.from = 0;
    }
    if(bodyQuery.channelGame.to == null){
        bodyQuery.channelGame.to = INFINITY;
    }

    console.log("create group object body" + JSON.stringify(body));
    console.log("create group object body query" + JSON.stringify(bodyQuery));
	var channel = CHANNEL_PAYMENT[gameId][body.channelPayment + ''];
    var timeMinAge = utils.TimeUtility.getCurrentTime(gameId) - bodyQuery.age.to;
    var timeMaxAge = utils.TimeUtility.getCurrentTime(gameId) - bodyQuery.age.from;
    var timeMinOnline = utils.TimeUtility.getCurrentTime(gameId) - bodyQuery.timeLastOnline.to;
    var timeMaxOnline = utils.TimeUtility.getCurrentTime(gameId) - bodyQuery.timeLastOnline.from;
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
            Users.getModel(gameId).updateMany({}, { $push: {groupObject: groupObject._id}, isModifiedOffer: true}, {new: true}, async function(err, raws){
                console.log("====================== 1 " + err);
                console.log('============ 2 ' + JSON.stringify(raws));
                if(raws.ok == 1) {
                    groupObject.totalUser = raws.nModified;
                    groupObject.totalCurrentUser = raws.nModified;
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
            .where('totalGame').gte(bodyQuery.totalGame.from).lte(bodyQuery.totalGame.to)
            .where('channelGame').gte(bodyQuery.channelGame.from).lte(bodyQuery.channelGame.to)
            .where("channelPayment." + channel + ".cost").gte(bodyQuery.totalCost.from).lte(bodyQuery.totalCost.to)
            .where("channelPayment." + channel + ".number").gte(bodyQuery.numberPay.from).lte(bodyQuery.numberPay.to)
            .where('lastPaidPack').gte(bodyQuery.lastPaidPack.from).lte(bodyQuery.lastPaidPack.to)
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

    let bodyQuery = _.cloneDeep(body);
    var INFINITY = 9999999999;
    //check value data
    if(bodyQuery.dataModify.totalGame.from == null){
        bodyQuery.dataModify.totalGame.from = 0;
    }
    if(bodyQuery.dataModify.totalGame.to == null){
        bodyQuery.dataModify.totalGame.to = INFINITY;
    }

    if(bodyQuery.dataModify.totalCost.from == null){
        bodyQuery.dataModify.totalCost.from = 0;
    }
    if(bodyQuery.dataModify.totalCost.to == null){
        bodyQuery.dataModify.totalCost.to = INFINITY;
    }

    if(bodyQuery.dataModify.numberPay.from == null){
        bodyQuery.dataModify.numberPay.from = 0;
    }
    if(bodyQuery.dataModify.numberPay.to == null){
        bodyQuery.dataModify.numberPay.to = INFINITY;
    }

    if(bodyQuery.dataModify.lastPaidPack.from == null){
        bodyQuery.dataModify.lastPaidPack.from = 0;
    }
    if(bodyQuery.dataModify.lastPaidPack.to == null){
        bodyQuery.dataModify.lastPaidPack.to = INFINITY;
    }

    if(bodyQuery.dataModify.age.from == null){
        bodyQuery.dataModify.age.from = 0;
    }
    if(bodyQuery.dataModify.age.to == null){
        bodyQuery.dataModify.age.to = utils.TimeUtility.getCurrentTime(gameId);
    }

    if(bodyQuery.dataModify.timeLastOnline.from == null){
        bodyQuery.dataModify.timeLastOnline.from = 0;
    }
    if(bodyQuery.dataModify.timeLastOnline.to == null){
        bodyQuery.dataModify.timeLastOnline.to = utils.TimeUtility.getCurrentTime(gameId);
    }

    if(bodyQuery.dataModify.channelGame.from == null){
        bodyQuery.dataModify.channelGame.from = 0;
    }
    if(bodyQuery.dataModify.channelGame.to == null){
        bodyQuery.dataModify.channelGame.to = INFINITY;
    }
    
    
    await GroupObjects.getModel(gameId).findByIdAndUpdate(body.idGroupObject, body.dataModify, {new: true}).exec(async function (err, groupObject) {
        if(err) {
            res.send({errorCode: ERROR_CODE.FAIL});
            return;
        }
        if(groupObject == null) {
            res.send({errorCode: ERROR_CODE.NOT_FOUND});
            return;
        }
        // cập nhật lại thời gian tạo 
        groupObject.createAt = utils.TimeUtility.getCurrentTime(gameId);

        await Users.getModel(gameId).updateMany({groupObject : mongoose.Types.ObjectId(body.idGroupObject)}, { $pull : { groupObject : { $in: [ mongoose.Types.ObjectId(body.idGroupObject) ] } }, isModifiedOffer: true},{ multi: true }).exec(async function(err, users){
            console.log("remove update " + JSON.stringify(users));
        });

        console.log("data group " + JSON.stringify(groupObject));
        var channel = CHANNEL_PAYMENT[gameId][groupObject.channelPayment + ''];
        var timeMinAge = utils.TimeUtility.getCurrentTime(gameId) - bodyQuery.dataModify.age.to;
        var timeMaxAge = utils.TimeUtility.getCurrentTime(gameId) - bodyQuery.dataModify.age.from;
        var timeMinOnline = utils.TimeUtility.getCurrentTime(gameId) - bodyQuery.dataModify.timeLastOnline.to;
        var timeMaxOnline = utils.TimeUtility.getCurrentTime(gameId) - bodyQuery.dataModify.timeLastOnline.from;
        
        await Users.getModel(gameId).updateMany({}, {$push: {groupObject: groupObject._id}, isModifiedOffer: true})
        .where('totalGame').gte(bodyQuery.dataModify.totalGame.from).lte(bodyQuery.dataModify.totalGame.to)
        .where('channelGame').gte(bodyQuery.dataModify.channelGame.from).lte(bodyQuery.dataModify.channelGame.to)
        .where("channelPayment." + channel + ".cost").gte(bodyQuery.dataModify.totalCost.from).lte(bodyQuery.dataModify.totalCost.to)
        .where("channelPayment." + channel + ".number").gte(bodyQuery.dataModify.numberPay.from).lte(bodyQuery.dataModify.numberPay.to)
        .where('lastPaidPack').gte(bodyQuery.dataModify.lastPaidPack.from).lte(bodyQuery.dataModify.lastPaidPack.to)
        .where('timeCreateAccount').gte(timeMinAge).lte(timeMaxAge)
        .where('lastTimeOnline').gte(timeMinOnline).lte(timeMaxOnline)
        .exec(async function (err, raws) {
            if(err) {
                logger.getLogger(gameId).info("edit group object fail " + err);
                return res.send({
                    errorCode: ERROR_CODE.FAIL
                });
            }
            if(raws && raws.ok == 1) {
                // console.log("usersAfters ===", usersAfters);
                groupObject.totalUser = raws.nModified;
                groupObject.totalCurrentUser = raws.nModified;
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
    await Users.getModel(gameId).updateMany({groupObject: mongoose.Types.ObjectId(body.idGroupObject)}, {$pull : { groupObject : mongoose.Types.ObjectId(body.idGroupObject) }, isModified: true}).exec(function (err, raw) {
        logger.getLogger(gameId).info("delete group object | delete group of user " + JSON.stringify(raw));
    });
    await GroupObjects.getModel(gameId).findByIdAndRemove(body.idGroupObject).exec(function (err, raw) {
        
    });
    await OfferLives.getModel(gameId).updateMany({groupObject: body.idGroupObject}, {groupObject: null}, {new: true}).exec(function (err, raws) {
        
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
    Users.getModel(gameId).find({groupObject: mongoose.Types.ObjectId(idGroupObject)}).skip(indexPage * numberOfPage).limit(numberOfPage).exec(function (err, users) {
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
    await GroupObjects.getModel(gameId).find({}).where("totalUser").gt(0).exec(async function (err, groupObjects) {
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

router.get('/search_by_name', function (req, res, next) {
    var gameId = req.query.gameId;
    var nameObject = req.query.nameObject;
    GroupObjects.getModel(gameId).find({nameObject:nameObject}).exec(function (err, raws) {
        res.send({
            errorCode: ERROR_CODE.SUCCESS,
            data: raws
        });
    });
});

router.get('/add_user_to_group', function (req, res, next) {
    var gameId = req.query.gameId;
    var uId = req.query.uId;
    var groupId = req.query.groupId;
    Users.getModel(gameId).findOne({userId: uId}).exec(function (err, raw) {
        if(raw) {
            Users.getModel(gameId).updateOne({userId: uId}, { $push: {groupObject: mongoose.Types.ObjectId(groupId)}, isModifiedOffer: true}, {new: true}, async function(err, raw){
                GroupObjects.getModel(gameId).updateOne({_id: groupId}, {$inc: {totalUser: 1, totalCurrentUser: 1}}).exec(function (err, raw1) {
                    if(raw1) {
                        logger.getLogger(gameId).info("add user to group " + uId + " | " + groupId);
                        res.send({
                            errorCode: ERROR_CODE.SUCCESS,
                            data: raw1
                        });
                    }
                })
            });
        }else{
            res.send({
                errorCode: ERROR_CODE.FAIL
            });
        }
    })
});
module.exports = router;