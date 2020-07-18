var GroupObjects = require('../models/group_objects');
var Users = require('../models/users');
var CHANNEL_PAYMENT = require('../const/channel_const');
var Utility = {
};
Utility.setCurrentServerTime = function (time) {
    if(time === undefined) {
        console.log("set current time server null");
        time = Math.round(Date.now() / 1000);
    }
    if(Utility.getCurrentTime.offsetClientVsServer == undefined) {
        Utility.getCurrentTime.offsetClientVsServer = 0;
    }
    Utility.getCurrentTime.offsetClientVsServer = Math.round(Date.now() / 1000) - time;
};

//lay thoi gian server hien tai
Utility.getCurrentTime = function () {
    if(Utility.getCurrentTime.offsetClientVsServer == undefined) {
        Utility.getCurrentTime.offsetClientVsServer = 0;
    }
    return Math.round(Date.now() / 1000) - Utility.getCurrentTime.offsetClientVsServer;
};

Utility.getOffetClientVsServer = function () {
    if(Utility.getCurrentTime.offsetClientVsServer == undefined) {
        return 0;
    }
    return Utility.getCurrentTime.offsetClientVsServer;
};

//kiem tra xem cac offer het han hay chua de giai phong user khoi rang buoc
Utility.checkStatusOfferLive = function (gameId) {
    GroupObjects.getModel(gameId).find({}).populate("offerLive").exec(function (err, groupObjects) {
        if(err) {
            console.log('GroupObjects check status offer live error');
            return;
        };
        for(var i in groupObjects) {
            var groupObject = groupObjects[i];
            if(groupObject.offerLive && Utility.getCurrentTime() >= groupObject.offerLive.timeFinish) {
                Users.getModel(gameId).find({groupObject: groupObject._id}, function (err, users) {
                    if(err) {
                        console.log('users check status offer live error');
                        return;
                    }
                    for(var i in users) {
                        users[i].groupObject = null;
                        users[i].save();
                    }
                });
            }
        }
    });
};
//tao default schema channel payment, su dung khi tao schema users
Utility.getDefaultSchemaChannelPayment= function(gameId) {
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
Utility.convertTimeClientToTimeServer = function (timeClient) {
    return timeClient + Utility.getOffetClientVsServer();
}
exports.Utility = Utility;
