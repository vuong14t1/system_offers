var express = require('express');
var router = express.Router();
var ERROR_CODE = require('../const/error_code');
var OfferLives = require('../models/offer_lives');
var GroupOffers = require('../models/group_offers');
var GroupObjects = require('../models/group_objects');
var Users = require('../models/users');
var utils = require('../methods/utils');
const ROLE = require('../const/role_const');
var mongoose = require('mongoose');
var HISTORY_HISTORY_CONST = require('../const/history_action_const');
// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
    if(req.path != "/tracking_show") {
        if(!req.session.loggedIn) {
            res.send({
                errorCode: ERROR_CODE.NOT_LOGIN
            });
            return;
        }
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

router.get('/list', function (req, res, next) {
    var gameId = req.query.gameId;
    utils.TimeUtility.checkStatusOfferLive(gameId);
    OfferLives.getModel(gameId).find({}).populate("groupOffer").populate("groupObject").exec(function (err, offer_lives) {
        if(err) {
            res.send({
                errorCode: ERROR_CODE.FAIL
            });
            return;
        }
        res.send({
            errorCode: ERROR_CODE.SUCCESS,
            data: offer_lives
        });
    });
});

router.post('/create', async function (req, res, next) {
    var gameId = req.query.gameId;
    var body = {
        idObject: req.body.idObject,
        idOffer: req.body.idOffer,
        timeStart: req.body.timeStart,
        timeFinish: req.body.timeFinish
    };
    if(body.idObject == null || body.idOffer == null) {
        return res.send({
            errorCode: ERROR_CODE.FAIL
        });
    }
    if(body.timeFinish == null || body.timeStart == null || body.timeFinish <= body.timeStart) {
        return res.send({
            errorCode: ERROR_CODE.FAIL
        });
    }
    //check moi user chi co 1 offer
    var offerLive = await OfferLives.getModel(gameId).findOne({groupObject: body.idObject, groupOffer: body.idOffer}).exec(function (err, offerLive) {

    });
    if(offerLive) {
        console.log("da ton tai offer live " + body.idObject + " | " + body.idOffer);
        return res.send({errorCode: ERROR_CODE.EXIST});
    }
    console.log("id object" + body.idObject);
    //TODO kiem tra dieu kien object do da duoc live offer hay chua
    await OfferLives.getModel(gameId).create({
        groupOffer: body.idOffer,
        groupObject: body.idObject,
        timeStart: body.timeStart,
        timeFinish: body.timeFinish,
        createAt: utils.TimeUtility.getCurrentTime(gameId)
    }, async function (error, raw) {
        if(error) {
            res.send({errorCode: ERROR_CODE.FAIL});
            return;
        }
        var groupObject = await GroupObjects.getModel(gameId).findById(body.idObject, function (error1, groupO) {
            if(groupO) {
                groupO.offerLive = raw._id;
                groupO.save();
                //notify to all users of group object
                Users.getModel(gameId).updateMany({
                    groupObject: mongoose.Types.ObjectId(groupO._id)
                }, {isModifiedOffer: true}, {new: true}).exec(function (err, users) {
                    
                });
            }
        });

        var groupOffer = await GroupOffers.getModel(gameId).findById(body.idOffer, function (error2, groupOffer) {

        });
        utils.HistoryActionUtility.addAction(gameId, req.session.email, "Đã chạy offer OFFER_" + groupOffer.seq + " với OBJECT_" + groupObject.seq, HISTORY_HISTORY_CONST.TAB.OFFER_LIVE);
        raw.groupOffer = groupOffer;
        raw.groupObject = groupObject;
        res.send({errorCode: ERROR_CODE.SUCCESS, data: raw});
    });

});

router.post('/delete', function (req, res, next) {
    var gameId = req.query.gameId;
    var body = {
        idOfferLive: req.body.idOfferLive
    };
    if(body.idOfferLive == null) {
        return res.send({
            errorCode: ERROR_CODE.FAIL
        });
    }
    OfferLives.getModel(gameId).findByIdAndRemove(body.idOfferLive).exec(function (err) {
        if(err) {
            res.send({
                errorCode: ERROR_CODE.FAIL
            });
        }else{
            GroupObjects.getModel(gameId).findOne({offerLive: body.idOfferLive}).exec(function (error1, groupO) {
                if(groupO) {
                    groupO.offerLive = null;
                    groupO.save();
                    //notify to all users of group object
                    Users.getModel(gameId).updateMany({
                        groupObject: mongoose.Types.ObjectId(groupO._id)
                    }, {isModifiedOffer: true}, {new: true}).exec(function (err, users) {
                        
                    });
                }
            });
            utils.HistoryActionUtility.addAction(gameId, req.session.email, "Đã xóa offer đang chạy có ID " + body.idOfferLive, HISTORY_HISTORY_CONST.TAB.OFFER_LIVE);
            res.send({
                errorCode: ERROR_CODE.SUCCESS
            });
        }
    });
});

router.post('/edit', async function (req, res, next) {
    var gameId = req.query.gameId;
    var body = {
        idOfferLive: req.body.idOfferLive,
        dataModify: req.body.dataModify
    };
    
    if(body.dataModify.timeFinish <= body.dataModify.timeStart) {
        return res.send({
            errorCode: ERROR_CODE.FAIL
        });
    }
    body.dataModify.isExpired = false;
    if(utils.TimeUtility.getCurrentTime() > body.dataModify.timeFinish) {
        body.dataModify.isExpired = true;
    }
    console.log("edit offer live " + JSON.stringify(body));
    body.dataModify.createAt = utils.TimeUtility.getCurrentTime(gameId);
    //xoa group cu
    await GroupObjects.getModel(gameId).findOneAndUpdate({offerLive: body.idOfferLive}, {offerLive: null}, {new: true}).exec(function (err, raws) {
        console.log("xoas group cu " + JSON.stringify(raws));
    });
    await OfferLives.getModel(gameId).findOneAndUpdate({_id: body.idOfferLive}, body.dataModify, {new: true}).populate("groupObject").populate("groupOffer").exec(function (err, offerLive) {
        if(err) {
            res.send({
                errorCode: ERROR_CODE.FAIL
            });
            return;
        }

        //notify to all users of group object
        Users.getModel(gameId).updateMany({
            groupObject: mongoose.Types.ObjectId(offerLive.groupObject._id)
        }, {isModifiedOffer: true}, {new: true}).exec(function (err, users) {
            
        });
        //cap nhat group moi
        if(body.dataModify.groupObject) {
            GroupObjects.getModel(gameId).findOneAndUpdate({_id: body.dataModify.groupObject}, {offerLive: offerLive._id}, {new: true}, function (err, raw) {
                console.log("cap nhat group moi " + JSON.stringify(raw));
            });
        }
        utils.HistoryActionUtility.addAction(gameId, req.session.email, "Đã chỉnh sửa offer đang chạy có ID " + body.idOfferLive, HISTORY_HISTORY_CONST.TAB.OFFER_LIVE);
        res.send({
            errorCode: ERROR_CODE.SUCCESS,
            data: offerLive
        });
    });
});

router.get("/tracking_show", async function (req, res, next) {
    var gameId = req.query.gameId;
    var idOfferLive = req.query.idOfferLive;
    if(idOfferLive == null) {
        res.send({
            errorCode: ERROR_CODE.FAIL
        });
        return;
    }
    await OfferLives.getModel(gameId).findOneAndUpdate({_id: idOfferLive}, { $inc: {totalShow : 1} }).exec(function (err, offerLive) {
        if(err) {
            console.log("tracking_show error: " + err);
            res.send({
                errorCode: ERROR_CODE.FAIL
            });
            return;
        }
        if(offerLive) {
            res.send({
                errorCode: ERROR_CODE.SUCCESS
            });
        }
    });
});

router.get('/show_detail', function (req, res, next) {
    var gameId = req.query.gameId;
    var idOfferLive = req.query.idOfferLive;
    OfferLives.getModel(gameId).findOne({_id: idOfferLive}).populate("groupOffer").populate("groupObject").exec(function (err, raw) {
        if(err) {
            return res.send({
                errorCode: ERROR_CODE.FAIL
            });
        }
        res.send({
            errorCode: ERROR_CODE.SUCCESS,
            data: raw
        });
    });
});
module.exports = router;