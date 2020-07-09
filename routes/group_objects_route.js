var express = require('express');
var router = express.Router();
var ERROR_CODE = require('../const/error_code');
var GroupObjects = require('../models/group_objects');
var Users = require('../models/users');
var CHANNEL_PAYMENT = require('../const/channel_const');
const ROLE = require('../const/role_const');
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
    GroupObjects.find({}, function (error, objects) {
        if(error) {
            console.log(error);
            return next();
        }
        res.send({erroCode: ERROR_CODE.SUCCESS,
                    data: objects
        });
        console.log("list object " + JSON.stringify(objects));
    });
    
});

router.post('/create', function (req, res, next) {
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
    var channel = CHANNEL_PAYMENT[body.channelPayment + ''];
    var timeMinAge = Date.now() - body.age.from;
    var timeMaxAge = Date.now() - body.age.to;
    var timeMinOnline = Date.now() - body.timeLastOnline.from;
    var timeMaxOnline = Date.now() - body.timeLastOnline.to;
    Users.find({})
    .where('groupObject').exists(false)
    .where('totalGame').gte(body.totalGame.from).lte(body.totalGame.to)
    .where('channelGame').gte(body.channelGame.from).lte(body.channelGame.to)
    .where("channelPayment."  + channel + ".cost").gte(body.totalCost.from).lte(body.totalCost.to)
    .where("channelPayment." + channel + ".number").gte(body.numberPay.from).lte(body.numberPay.to)
    .where('lastPaidPack').gte(body.lastPaidPack.from).lte(body.lastPaidPack.to)
    .where('timeCreateAccount').gte(timeMinAge).lte(timeMaxAge)
    // .where('timeLastOnline').gte(timeMinOnline).lte(timeMaxOnline)
    .exec(function (error, users){
        console.log('============ res ' + JSON.stringify(users));
        if(users.length <= 0) {
            res.send({erroCode: ERROR_CODE.EMPTY});
            return;
        }
        GroupObjects.create({
            totalUser: users.length,
            totalGame: {
                from: body.totalGame.from,
                to: body.totalGame.to
            },
            channelPayment: body.channelPayment,
            totalCost: {
                from: body.totalCost.fromm,
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
        }, function (error, groupObject) {
            if(error) {
                console.log("create group object fail");
                res.send({errorCode: ERROR_CODE.FAIL});
            }else{
                console.log("create group object success");
                for(var i in users) {
                    users[i].groupObject = groupObject._id;
                    users[i].save(function (error, data) {
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
    var body = {
        idGroupOffer: req.body.idGroupOffer,
        nameObject: req.body.nameObject
    };
    GroupObjects.findByIdAndUpdate(body.idGroupOffer, {nameObject: body.nameObject}, {new: true}, function (err, groupObject) {
        if(err) {
            res.send({errorCode: ERROR_CODE.FAIL});
            return;
        }
        res.send({errorCode: ERROR_CODE.SUCCESS, data: groupObject});
    });
});
module.exports = router;