var Users = require('../models/users');
var GroupObjects = require('../models/group_objects');
var GroupOffers = require('../models/group_offers');
var OfferLives = require('../models/offer_lives');
var ERROR_CODE = require('../const/error_code');
var CHANNEL_PAYMENT = require('../const/channel_const');
var utils = require('../methods/utils');
var logger = require('../methods/winston');

async function trackingUserLogin(gameId, message) {
    logger.getLogger(gameId).info("tracking user login gameId: " + gameId + " | message:" + message);
    var props = message.split("|");
    if(props.length != 5) return;
    var userId = props[0];
    var timeCreateAccount = props[1];
    var lastTimeOnline = props[2];
    var channelGame = props[3];
    var timeServer = props[4];
    var body = {
        userId: userId,
        timeCreateAccount: timeCreateAccount,
        lastTimeOnline: lastTimeOnline,
        channelGame: channelGame,
        timeServer: timeServer
    };
    utils.TimeUtility.setCurrentServerTime(gameId, body.timeServer);
    await Users.getModel(gameId).findOneAndUpdate({userId: body.userId}, {lastTimeOnline: body.lastTimeOnline, timeCreateAccount: body.timeCreateAccount, channelGame: body.channelGame}, {new: true}, async function(error, user){
        if(error) return next(error);
        console.log("update === " + JSON.stringify(user));
        if(user != null) {        
            
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
    logger.getLogger(gameId).info("tracking stats game gameId: " + gameId + " | message:" + message);
    var props = message.split("|");
    if(props.length != 4) return;
    var body = {
        userId: props[0],
        totalGame: props[1],
        channelGame: props[2],
        timeServer: props[3]
    };
    utils.TimeUtility.setCurrentServerTime(gameId, body.timeServer);
    await Users.getModel(gameId).findOneAndUpdate({userId: body.userId}, {totalGame: body.totalGame, channelGame: body.channelGame}, {new: true}, function (error, user) {
        if(user != null) {
            
        }else{
            Users.getModel(gameId).create({userId: body.userId, totalGame: body.totalGame, channelGame: body.channelGame}, function(error, user) {
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
    logger.getLogger(gameId).info("tracking payment game gameId: " + gameId + " | message:" + message);
    var props = message.split("|");
    if(props.length != 4) return;
    var body = {
        userId: props[0],
        lastPaidPack: parseInt(props[1]),
        channelPayment: props[2],
        timeServer: props[3]
    };
    utils.TimeUtility.setCurrentServerTime(gameId, body.timeServer);
    Users.getModel(gameId).findOne({userId: body.userId}, async function (error, user) {
        if(user != null) {
            user.lastPaidPack = body.lastPaidPack;
            console.log("before tracking payment " + JSON.stringify(user));
            var channel = CHANNEL_PAYMENT[gameId][body.channelPayment + ''];
            if(user.channelPayment[channel] != null) {
                user.channelPayment[channel].cost += body.lastPaidPack;
                user.channelPayment[channel].number += 1;
            }
            Users.getModel(gameId).findOneAndUpdate({userId: body.userId}, {lastPaidPack: user.lastPaidPack, channelPayment: user.channelPayment}, {new: true}, function () {

            });
        }
    });
}

async function trackingBoughtOfferLive(gameId, message) {
    logger.getLogger(gameId).info("tracking bought gameId: " + gameId + " | message:" + message);
    var props = message.split('|');
    var userId = props[0];
    var idOfferLive = props[1];
    var body = {
        userId: userId,
        idOfferLive: idOfferLive
    };
    //sau khi mua xong thi xoa ref toi  group object
    Users.getModel(gameId).findOneAndUpdate({userId: userId}, {groupObject: null}, {new: true}, function (err, raw) {

    });
    await OfferLives.getModel(gameId).findOne({_id: body.idOfferLive}, async function(err, offerLive){
        if(err) {
            console.log("trackingBoughtOfferLive err: " + err);
            return;
        }
        if(offerLive) {
            offerLive.totalBought += 1;
            await offerLive.save();
        }
    });
}

module.exports.trackingUserLogin = trackingUserLogin;
module.exports.trackingStatsGame = trackingStatsGame;
module.exports.trackingPayment = trackingPayment;
module.exports.trackingBoughtOfferLive = trackingBoughtOfferLive;
