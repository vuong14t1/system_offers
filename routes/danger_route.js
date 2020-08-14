var express = require('express');
var router = express.Router();
var ERROR_CODE = require('../const/error_code');
var GroupObjects = require('../models/group_objects');
var GroupOffers = require('../models/group_offers');
var OfferLives = require('../models/offer_lives');
var Users = require('../models/users');
var logger = require('../methods/winston');
var utils = require('../methods/utils');
var HISTORY_HISTORY_CONST = require('../const/history_action_const');
router.get('/delete_all_users', function (req, res, next) { 
    var gameId = req.query.gameId;
    if(process.env.MODE_BUILD == "live") {
        return res.send("No permission!");
    }
    Users.getModel(gameId).deleteMany({}).exec(function (err, response) {
        if(err) {
            logger.getLogger(gameId).info("Account: " + req.session.email + " deleted all collection of users fail!");
        }else{
            logger.getLogger(gameId).info("Account: " + req.session.email + " deleted all collection of users success!");
            utils.HistoryActionUtility.addAction(gameId, req.session.email, "Xóa tất cả users.Vãi!", HISTORY_HISTORY_CONST.TAB.DANGER);
            return res.send({
                errorCode: ERROR_CODE.SUCCESS
            });
        }
    });

    GroupObjects.getModel(gameId).updateMany({},{totalCurrentUser: 0}).exec(function(err, raw) {
        
    })
});

router.get('/delete_all_group_object', function (req, res, next) { 
    var gameId = req.query.gameId;
    if(process.env.MODE_BUILD == "live") {
        return res.send("No permission!");
    }
    GroupObjects.getModel(gameId).deleteMany({}).exec(function (err, response) {
        if(err) {
            logger.getLogger(gameId).info("Account: " + req.session.email + " deleted all collection of GroupObjects fail!");
        }else{
            logger.getLogger(gameId).info("Account: " + req.session.email + " deleted all collection of GroupObjects success!");
            utils.HistoryActionUtility.addAction(gameId, req.session.email, "Xóa tất cả object.Vãi!", HISTORY_HISTORY_CONST.TAB.DANGER);
            return res.send({
                errorCode: ERROR_CODE.SUCCESS
            });
        }
    });
});

router.get('/delete_all_group_offer', function (req, res, next) { 
    var gameId = req.query.gameId;
    if(process.env.MODE_BUILD == "live") {
        return res.send("No permission!");
    }
    GroupOffers.getModel(gameId).deleteMany({}).exec(function (err, response) {
        if(err) {
            logger.getLogger(gameId).info("Account: " + req.session.email + " deleted all collection of GroupOffers fail!");
        }else{
            utils.HistoryActionUtility.addAction(gameId, req.session.email, "Xóa tất cả offers.Vãi!", HISTORY_HISTORY_CONST.TAB.DANGER);
            logger.getLogger(gameId).info("Account: " + req.session.email + " deleted all collection of GroupOffers success!");
            return res.send({
                errorCode: ERROR_CODE.SUCCESS
            });
        }
    });
});


router.get('/delete_all_offer_live', function (req, res, next) { 
    var gameId = req.query.gameId;
    if(process.env.MODE_BUILD == "live") {
        return res.send("No permission!");
    }
    OfferLives.getModel(gameId).deleteMany({}).exec(function (err, response) {
        if(err) {
            logger.getLogger(gameId).info("Account: " + req.session.email + " deleted all collection of OfferLives fail!");
        }else{
            utils.HistoryActionUtility.addAction(gameId, req.session.email, "Xóa tất cả offer đang chạy.Vãi!");
            logger.getLogger(gameId).info("Account: " + req.session.email + " deleted all collection of OfferLives success!");
            return res.send({
                errorCode: ERROR_CODE.SUCCESS
            });
        }
    });
});

module.exports = router;