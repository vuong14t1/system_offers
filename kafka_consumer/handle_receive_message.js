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
    var userId = props[0];
    var timeCreateAccount = props[1];
    var lastTimeOnline = props[2];
    var channelGame = props[3];
    var totalGame = props[4];
    var timeServer = props[5];
    var body = {
        userId: userId,
        timeCreateAccount: timeCreateAccount,
        lastTimeOnline: lastTimeOnline,
        channelGame: channelGame,
        totalGame: totalGame,
        timeServer: timeServer
    };
    utils.TimeUtility.setCurrentServerTime(gameId, body.timeServer);
    await Users.getModel(gameId).findOneAndUpdate({userId: body.userId}, {lastTimeOnline: body.lastTimeOnline, timeCreateAccount: body.timeCreateAccount, channelGame: body.channelGame, totalGame: body.totalGame}, {new: true}).exec(async function(error, user){
        if(error) return next(error);
        logger.getLogger(gameId).info("update usser login === " + JSON.stringify(user));
        if(user != null) {        
            
        }else{
            await Users.getModel(gameId).create({
                userId: body.userId,
                timeCreateAccount: body.timeCreateAccount,
                lastTimeOnline: body.lastTimeOnline,
                channelGame: body.channelGame,
                totalGame: body.totalGame
            }, function (error, user1) {
                if(error) {
                    console.log('post user login error');
                }else{
                    logger.getLogger(gameId).info("create usser login === " + JSON.stringify(user1));
                }
            });
        }

    });
}

async function trackingStatsGame(gameId, message) {
    logger.getLogger(gameId).info("tracking stats game gameId: " + gameId + " | message:" + message);
    var props = message.split("|");
    var body = {
        userId: props[0],
        totalGame: props[1],
        channelGame: props[2],
        timeServer: props[3]
    };
    utils.TimeUtility.setCurrentServerTime(gameId, body.timeServer);
    await Users.getModel(gameId).findOneAndUpdate({userId: body.userId}, {totalGame: body.totalGame, channelGame: body.channelGame}, {new: true}).exec(function (error, user) {
        
    });
}

async function trackingPayment(gameId, message) {
    logger.getLogger(gameId).info("tracking payment game gameId: " + gameId + " | message:" + message);
    var props = message.split("|");
    var body = {
        userId: props[0],
        lastPaidPack: parseInt(props[1]),
        channelPayment: props[2],
        timeServer: props[3]
    };
    utils.TimeUtility.setCurrentServerTime(gameId, body.timeServer);
    Users.getModel(gameId).findOne({userId: body.userId}).exec(async function (error, user) {
        if(user != null) {
            user.lastPaidPack = body.lastPaidPack;
            console.log("before tracking payment " + JSON.stringify(user));
            var channel = CHANNEL_PAYMENT[gameId][body.channelPayment + ''];
            if(user.channelPayment[channel] != null) {
                user.channelPayment[channel].cost += body.lastPaidPack;
                user.channelPayment[channel].number += 1;
            }
            Users.getModel(gameId).findOneAndUpdate({userId: body.userId}, {lastPaidPack: user.lastPaidPack, channelPayment: user.channelPayment}, {new: true}).exec(function () {

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
    Users.getModel(gameId).findOneAndUpdate({userId: userId}, {groupObject: null}, {new: true}).exec(function (err, raw) {

    });
    await OfferLives.getModel(gameId).findOneAndUpdate({_id: body.idOfferLive}, { $inc: { totalBought: 1}}).exec(async function(err, offerLive){
        if(err) {
            console.log("trackingBoughtOfferLive err: " + err);
            return;
        }
    });
}

module.exports.trackingUserLogin = trackingUserLogin;
module.exports.trackingStatsGame = trackingStatsGame;
module.exports.trackingPayment = trackingPayment;
module.exports.trackingBoughtOfferLive = trackingBoughtOfferLive;
