var GroupObjects = require('../models/group_objects');
var Users = require('../models/users');
var Accounts = require('../models/accounts');
var GroupOffers = require('../models/group_offers');
var OfferLives = require('../models/offer_lives');
var CHANNEL_PAYMENT = require('../const/channel_const');
var registerGameConf = require('../conf/register_games.json');
var logger = require('./winston');
var mongoose = require('mongoose');
var TimeUtility = {
};
var SchemaUtility = {};
//dong bo thoi gian voi server tung game
TimeUtility.setCurrentServerTime = function (gameId, time) {
    logger.getLogger(gameId).info("set current time server " + time);
    gameId = gameId === undefined? "p13": gameId;
    if(time === undefined) {
        console.log("set current time server null");
        time = Math.round(Date.now() / 1000);
    }
    if(TimeUtility.getCurrentTime.offsetClientVsServer == undefined) {
        TimeUtility.getCurrentTime.offsetClientVsServer = {};
    }
    if(TimeUtility.getCurrentTime.offsetClientVsServer[gameId] == undefined) {
        TimeUtility.getCurrentTime.offsetClientVsServer[gameId] = 0;
    }
    if(TimeUtility.getCurrentTime.offsetClientVsServer === undefined) {
        TimeUtility.getCurrentTime.offsetClientVsServer = {};
    }
    TimeUtility.getCurrentTime.offsetClientVsServer[gameId] = Math.round(Date.now() / 1000) - time;
};

//lay thoi gian server hien tai
TimeUtility.getCurrentTime = function (gameId) {
    gameId = gameId === undefined? "p13": gameId;
    if(TimeUtility.getCurrentTime.offsetClientVsServer == undefined) {
        TimeUtility.getCurrentTime.offsetClientVsServer = {};
    }
    if(TimeUtility.getCurrentTime.offsetClientVsServer[gameId] == undefined) {
        TimeUtility.getCurrentTime.offsetClientVsServer[gameId] = 0;
    }
    logger.getLogger(gameId).info("offset time client vs server: " + TimeUtility.getCurrentTime.offsetClientVsServer[gameId]);
    return (Math.round(Date.now() / 1000) - TimeUtility.getCurrentTime.offsetClientVsServer[gameId]);
};

TimeUtility.getOffetClientVsServer = function (gameId) {
    if(TimeUtility.getCurrentTime.offsetClientVsServer == undefined) {
        TimeUtility.getCurrentTime.offsetClientVsServer = {};
    }
    if(TimeUtility.getCurrentTime.offsetClientVsServer[gameId] == undefined) {
        return 0;
    }
    return TimeUtility.getCurrentTime.offsetClientVsServer[gameId];
};

//kiem tra xem cac offer het han hay chua de giai phong user khoi rang buoc
TimeUtility.checkStatusOfferLive = async function (gameId) {
    await GroupObjects.getModel(gameId).find({}).where("offerLive").ne(null).populate("offerLive").exec(async function (err, groupObjects) {
        if(err) {
            logger.getLogger(gameId).info('GroupObjects check status offer live error' + err);
            return;
        };
        logger.getLogger(gameId).info('checkStatusOfferLive' + JSON.stringify(groupObjects));
        for await (let group of groupObjects) {
            if(group.offerLive == null || group.offerLive.isExpired) {
                continue;
            }
            logger.getLogger(gameId).info("check status offer " + JSON.stringify(group._id) +"current time " + TimeUtility.getCurrentTime() + "| time finish " + group.offerLive.timeFinish);
            if(group.offerLive && TimeUtility.getCurrentTime() >= group.offerLive.timeFinish) {
                group.offerLive.isExpired = true;
                group.offerLive.save();
                group.totalCurrentUser = 0;
                group.save();
                logger.getLogger(gameId).info("This offer is experied!");
                // Users.getModel(gameId).updateMany({groupObject: mongoose.Types.ObjectId(group._id)}, {$pull: {groupObject: mongoose.Types.ObjectId(group._id)}, isModifiedOffer: true}, {new: true}, function (err, users) {
                // });
            }
        }
    });
};
//tao default schema channel payment, su dung khi tao schema users
SchemaUtility.getDefaultSchemaChannelPayment= function(gameId) {
    gameId = gameId === undefined? "p13": gameId;
    var schema = [];
    for(var i in CHANNEL_PAYMENT[gameId]) {
        schema[CHANNEL_PAYMENT[gameId][i]] = {
            channel: i + '',
            cost: 0,
            number: 0
        };
    }
    return schema;
}
//lay thoi gian server tu thoi gian client
TimeUtility.convertTimeClientToTimeServer = function (gameId, timeClient) {
    return timeClient + TimeUtility.getOffetClientVsServer(gameId);
}
//load tat cac schema cua game
SchemaUtility.loadAllSchema = function () {
    for(var i in registerGameConf ) {
        Accounts.getModel(i);
        Users.getModel(i);
        GroupObjects.getModel(i);
        GroupOffers.getModel(i);
        OfferLives.getModel(i);
    }
}
//kiem tra gameId ra duoc dang ki config o file register game hay chua?
SchemaUtility.isRegisteredGame = function (gameId) {
    return registerGameConf[gameId] !== undefined;
}
exports.TimeUtility = TimeUtility;
exports.SchemaUtility = SchemaUtility;
