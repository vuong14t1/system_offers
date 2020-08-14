var express = require('express');
var router = express.Router();
var HistoryAction = require("../models/history_action")
var ERROR_CODE = require('../const/error_code');
var utils = require("../methods/utils");    
router.use(function timeLog (req, res, next) {
    console.log('Time: ', Date.now())
    if(!req.session.loggedIn) {
        res.send({
            errorCode: ERROR_CODE.NOT_LOGIN
        });
        return;
    }
    next()
})
router.get('/list', function (req, res, next) {
    var gameId = req.query.gameId;
    var tab = req.query.tab;
    HistoryAction.getModel(gameId).find({tab: tab}).exec(function (error, raws) {
        if(error) {
            return res.send({
                errorCode: ERROR_CODE.FAIL
            });
        }
        return res.send({
            errorCode: ERROR_CODE.SUCCESS,
            data: raws
        });
    })
});

router.post('/add', function (req, res, next) {
    var gameId = req.query.gameId;
    var author = req.query.author;
    var msg = req.query.msg;
    var tab = req.query.tab
    
    HistoryAction.getModel(gameId).create({
        author: author,
        msg: msg,
        createAt: utils.TimeUtility.getCurrentTime(gameId),
        tab: tab
    }, function (err, raw) {
        if(error) {
            return res.send({
                errorCode: ERROR_CODE.FAIL
            });
        }
        return res.send({
            errorCode: ERROR_CODE.SUCCESS,
            data: raw
        }); 
    });
});
module.exports = router;