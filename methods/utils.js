var GroupObjects = require('../models/group_objects');
var Users = require('../models/users');
var CHANNEL_PAYMENT = require('../const/channel_const');
var TimeUtility = {
};
var SchemaUtility = {};
TimeUtility.setCurrentServerTime = function (gameId, time) {
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
    return Math.round(Date.now() / 1000) - TimeUtility.getCurrentTime.offsetClientVsServer[gameId];
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
            console.log('GroupObjects check status offer live error' + err);
            return;
        };
        for await (let group of groupObjects) {
            if(group.offerLive && TimeUtility.getCurrentTime() >= group.offerLive.timeFinish) {
                await Users.getModel(gameId).find({groupObject: group._id}, async function (err, users) {
                    if(err) {
                        console.log('users check status offer live error');
                        return;
                    }
                    for(var i in users) {
                        users[i].groupObject = null;
                        await users[i].save();
                    }
                });
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
            channel: i +' ',
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
exports.TimeUtility = TimeUtility;
exports.SchemaUtility = SchemaUtility;
