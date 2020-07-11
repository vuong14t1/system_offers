var GroupObjects = require('../models/group_objects');
var Users = require('../models/users');
var Utility = {
};
Utility.setCurrentServerTime = function (time) {
    if(Utility.getCurrentTime.offsetClientVsServer == undefined) {
        Utility.getCurrentTime.offsetClientVsServer = 0;
    }
    Utility.getCurrentTime.offsetClientVsServer = Math.round(Date.now() / 1000) - time;
};

Utility.getCurrentTime = function () {
    if(Utility.getCurrentTime.offsetClientVsServer == undefined) {
        Utility.getCurrentTime.offsetClientVsServer = 0;
    }
    return Math.round(Date.now() / 1000) - Utility.getCurrentTime.offsetClientVsServer;
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
exports.Utility = Utility;
