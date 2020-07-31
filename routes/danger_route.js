var express = require('express');
var router = express.Router();
var ERROR_CODE = require('../const/error_code');
var GroupObjects = require('../models/group_objects');
var GroupOffers = require('../models/group_offers');
var OfferLives = require('../models/offer_lives');
var Users = require('../models/users');
var logger = require('../methods/winston');
router.get('/delete_all_users', function (req, res, next) { 
    var gameId = req.query.gameId;
    if(process.env.MODE_BUILD == "live") {
        return res.send("No permission!");
    }
    Users.getModel(gameId).deleteMany({}, function (err, res) {
        if(err) {
            logger.getLogger(gameId).info("Account: " + req.session.email + " deleted all collection of users fail!");
        }else{
            logger.getLogger(gameId).info("Account: " + req.session.email + " deleted all collection of users success!");
            return res.send({
                errorCode: ERROR_CODE.SUCCESS
            });
        }
    });

    GroupObjects.getModel(gameId).updateMany({totalCurrentUser: 0}, function(err, raw) {
        
    })
});

router.get('/delete_all_group_object', function (req, res, next) { 
    var gameId = req.query.gameId;
    if(process.env.MODE_BUILD == "live") {
        return res.send("No permission!");
    }
    GroupObjects.getModel(gameId).deleteMany({}, function (err, res) {
        if(err) {
            logger.getLogger(gameId).info("Account: " + req.session.email + " deleted all collection of GroupObjects fail!");
        }else{
            logger.getLogger(gameId).info("Account: " + req.session.email + " deleted all collection of GroupObjects success!");
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
    GroupOffers.getModel(gameId).deleteMany({}, function (err, res) {
        if(err) {
            logger.getLogger(gameId).info("Account: " + req.session.email + " deleted all collection of GroupOffers fail!");
        }else{
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
    OfferLives.getModel(gameId).deleteMany({}, function (err, res) {
        if(err) {
            logger.getLogger(gameId).info("Account: " + req.session.email + " deleted all collection of OfferLives fail!");
        }else{
            logger.getLogger(gameId).info("Account: " + req.session.email + " deleted all collection of OfferLives success!");
            return res.send({
                errorCode: ERROR_CODE.SUCCESS
            });
        }
    });
});

module.exports = router;