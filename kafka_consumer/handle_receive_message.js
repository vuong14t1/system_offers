var Users = require('../models/users');
var GroupObjects = require('../models/group_objects');
var GroupOffers = require('../models/group_offers');
var ERROR_CODE = require('../const/error_code');
var CHANNEL_PAYMENT = require('../const/channel_const');
var utils = require('../methods/utils');

async function trackingUserLogin(gameId, message) {
    var arrMessage = message.split("|");
    if(arrMessage.length != 5) return;
    var userId = arrMessage[0];
    var timeCreateAccount = arrMessage[1];
    var lastTimeOnline = arrMessage[2];
    var channelGame = arrMessage[3];
    var timeServer = arrMessage[4];
    var body = {
        userId: userId,
        timeCreateAccount: timeCreateAccount,
        lastTimeOnline: lastTimeOnline,
        channelGame: channelGame,
        timeServer: timeServer
    };
    utils.TimeUtility.setCurrentServerTime(gameId, body.timeServer);
    await Users.getModel(gameId).findOne({userId: body.userId}, async function(error, user){
        if(error) return next(error);
        if(user != null) {        
            user.lastTimeOnline = body.lastTimeOnline;
            user.timeCreateAccount = body.timeCreateAccount;
            user.channelGame = body.channelGame;
            user.save(function (error, user) {
                if(error) {
                    console.log('post update user login error');
                }else{
                    console.log('user exist' + JSON.stringify(user));
                }
            });
        }else{
            await Users.getModel(gameId).create({
                userId: body.userId,
                timeCreateAccount: body.timeCreateAccount,
                lastTimeOnline: body.lastTimeOnline,
                channelGame: body.channelGame
            }, function (error, user) {
                if(error) {
                    console.log('post user login error');
                }else{
                }
            });
        }

    });
}

async function trackingStatsGame(gameId, message) {
    var arrMessage = message.split("|");
    if(arrMessage.length != 4) return;
    var body = {
        userId: arrMessage[0],
        totalGame: arrMessage[1],
        channelGame: arrMessage[2],
        timeServer: arrMessage[3]
    };
    utils.TimeUtility.setCurrentServerTime(gameId, body.timeServer);
    await Users.getModel(gameId).findOne({userId: body.userId}, async function (error, user) {
        if(user != null) {
            user.totalGame = body.totalGame;
            user.channelGame = body.channelGame;
            user.save(function (error, user) {
                if(error) {
                }else{
                }
            });
        }else{
            await Users.getModel(gameId).create({userId: body.userId, totalGame: body.totalGame, channelGame: body.channelGame}, function(error, user) {
                if(error) {
                    console.log('post user login error');
                }else{
                    console.log('post user login success: ' + JSON.stringify(user));
                }
            });
        }
    });
}

async function trackingPayment(gameId, message) {
    var arrMessage = message.split("|");
    if(arrMessage.length != 4) return;
    var body = {
        userId: arrMessage[0],
        lastPaidPack: arrMessage[1],
        channelPayment: arrMessage[2],
        timeServer: arrMessage[3]
    };
    utils.TimeUtility.setCurrentServerTime(gameId, timeServer);
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
                }else{
                }
            });
        }else{
            Users.getModel(gameId).create({userId: body.userId, lastPaidPack: body.lastPaidPack, channelPayment: [{channel: body.channelPayment, cost: body.lastPaidPack}]}, function(error, user) {
                if(error) {
                    console.log('post user login error');
                }else{
                    console.log('post user login success: ' + JSON.stringify(user));
                }
            });
        }
    });
}

module.exports.trackingUserLogin = trackingUserLogin;
module.exports.trackingStatsGame = trackingStatsGame;
module.exports.trackingPayment = trackingPayment;
