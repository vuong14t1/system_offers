var express = require('express');
var router = express.Router();
var Users = require('../models/users');
var ERROR_CODE = require('../const/error_code');
// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
    console.log('Time: ', Date.now())
    next()
})

router.post('/user_login', function (req, res, next) {
    console.log("post user login");
    var body = {
        userId: req.body.userId,
        timeCreateAccount: req.body.timeCreateAccount,
        lastTimeOnline: req.body.lastTimeOnline
    };
    Users.findOne({userId: body.userId}, function(error, user){
        if(error) return next(error);
        if(user != null) {        
            user.lastTimeOnline = body.lastTimeOnline;
            user.timeCreateAccount = body.timeCreateAccount;
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
            Users.create({
                userId: body.userId,
                timeCreateAccount: body.timeCreateAccount,
                lastTimeOnline: body.lastTimeOnline
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

router.post('/stats_game', function (req, res, next) {
    var body = {
        userId: req.body.userId,
        totalGame: req.body.totalGame
    };
    Users.findOne({userId: body.userId}, function (error, user) {
        if(user != null) {
            user.totalGame = body.totalGame;
            user.save(function (error, user) {
                if(error) {
                    res.send({erroCode: ERROR_CODE.FAIL});
                }else{
                    res.send({erroCode: ERROR_CODE.SUCCESS});
                }
            });
        }else{
            Users.create({userId: body.userId, totalGame: body.totalGame}, function(error, user) {
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

router.post('/lastPayment', function(req, res, next){
    var body = {
        userId: req.body.userId,
        lastPaidPack: req.body.lastPaidPack,
        channelPayment: req.body.channelPayment
    };
    Users.findOne({userId: body.userId}, function (error, user) {
        if(user != null) {
            user.lastPaidPack = body.lastPaidPack;
            var indexChannelP = user.channelPayment.findIndex(function (o) {
                return o.channel == body.channelPayment
            });
            console.log("index channel " + indexChannelP);
            if(indexChannelP > -1) {
                user.channelPayment[indexChannelP].cost += body.lastPaidPack;
            }else{
                user.channelPayment = user.channelPayment.concat([{
                    channel: body.channelPayment,
                    cost: body.lastPaidPack
                }]);
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
            Users.create({userId: body.userId, lastPaidPack: body.lastPaidPack, channelPayment: [{channel: body.channelPayment, cost: lastPaidPack}]}, function(error, user) {
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
module.exports = router;