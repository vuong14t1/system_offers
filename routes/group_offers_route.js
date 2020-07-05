var express = require('express');
var router = express.Router();
var ERROR_CODE = require('../const/error_code');
var GroupOffers = require('../models/group_offers');
// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
    console.log('Time req group offer: ', Date.now());
    next()
})

router.get('/list', function (req, res, next) {
    GroupOffers.find({}, function (error, offers) {
        if(error) {
            console.log(error);
            return next();
        }
        res.send({
            erroCode: ERROR_CODE.SUCCESS,
            data: offers
        });
        console.log("list offers " + JSON.stringify(offers));
    });
});

router.post('/create', function (req, res, next) {
    var body = {
        nameOffer: req.body.nameOffer,
        durationLive: req.body.durationLive,
        durationCountDown: req.body.durationCountDown,
        description: req.body.description,
        type: req.body.type,
        value: req.body.value,
        originalCost: req.body.originalCost,
        promotionCost: req.body.promotionCost
    };
    GroupOffers.create({
        nameOffer: body.nameOffer,
        durationLive: body.durationLive,
        durationCountDown: body.durationCountDown,
        description: body.description,
        type: body.type,
        value: body.value,
        originalCost: body.originalCost,
        promotionCost: body.promotionCost
    }, function (error, offer) {
        if(error) {
            res.send({
                errorCode: ERROR_CODE.FAIL
            });
            return;
        }
        res.send({
            errorCode: ERROR_CODE.SUCCESS,
            data: offer
        });

    });
});

router.post('/delete', function (req, res, next) {
    var body = {
        idOffer: req.body.idOffer
    };
    GroupOffers.findByIdAndRemove(body.idOffer, function (err) {
        if(err) {
            res.send({
                errorCode: ERROR_CODE.FAIL
            });
        }else{
            res.send({
                errorCode: ERROR_CODE.SUCCESS
            });
        }
    });
});

router.post('/edit', function (req, res, next) {
    var body = {
        idOffer: req.body.idOffer,
        dataModify: req.body.dataModify
    };
    GroupOffers.findOneAndUpdate({_id: body.idOffer}, body.dataModify, {new: true}, function (err, raw) {
        if(err) {
            res.send({
                errorCode: ERROR_CODE.FAIL
            });
        }else{
            res.send({
                errorCode: ERROR_CODE.SUCCESS,
                data: raw
            });
        }
    });
});
module.exports = router;