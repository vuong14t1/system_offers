var express = require('express');
var router = express.Router();
var ERROR_CODE = require('../const/error_code');
var Accounts = require("../models/accounts");
var md5 = require('md5');
const ROLE = require('../const/role_const');
const e = require('express');
router.use(['/delete', '/edit'],function timeLog (req, res, next) {
    if(!req.session.loggedIn) {
        res.send({
            errorCode: ERROR_CODE.NOT_LOGIN
        });
        return;
    }
    if(req.session.role != ROLE.SUPER_ADMIN) {
        res.send({
            errorCode: ERROR_CODE.NOT_PERMISSION
        });
        return;
    }
    next()
})

router.use('/list',function timeLog (req, res, next) {
    if(!req.session.loggedIn) {
        res.send({
            errorCode: ERROR_CODE.NOT_LOGIN
        });
        return;
    }
    next()
})

router.post("/login", function (req, res, next) {
    var gameId = req.query.gameId;
    var body = {
        email: req.body.email,
        password: md5(req.body.password)
    };
    Accounts.getModel(gameId).findOne({email: body.email, password: body.password}, function (err, account) {
        if(account) {
            if(err) {

                return next(err);
            }
            
            if(!account) {
                res.send({
                    errorCode: ERROR_CODE.FAIL
                });
                return;
            }
            req.session.loggedIn = account._id.toString();
            req.session.email = account.email;
            req.session.role = account.role;
            res.send({
                errorCode: ERROR_CODE.SUCCESS,
                data: account
            });
        }else{
            res.send({
                errorCode: ERROR_CODE.FAIL
            });
        }
    });
});

router.get("/logout", function (req, res, next) {
    req.session.loggedIn = null;
    req.session.email = null;
    req.session.role = null;
    res.send({
        errorCode: ERROR_CODE.SUCCESS
    });
});

router.get('/list', function (req, res, next) {
    var gameId = req.query.gameId;
    Accounts.getModel(gameId).find({}, function (err, accounts) {
        res.send({
            errorCode: ERROR_CODE.SUCCESS,
            data: accounts
        });
    });
});

router.post('/delete', function (req, res, next) {
    var gameId = req.query.gameId;
    var body = {
        idAccount: req.body.idAccount
    };
    Accounts.getModel(gameId).findByIdAndRemove(body.idAccount, function (err) {
        res.send({
            errorCode: ERROR_CODE.SUCCESS
        });
    });
});

router.post('/edit', function (req, res, next) {
    var gameId = req.query.gameId;
    var body = {
        id: req.body.id,
        dataModify: req.body.dataModify
    };
    Accounts.getModel(gameId).findByIdAndUpdate(body.id, body.dataModify, {new: true}, function(err, account) {
        if(err) {
            return res.send({errorCode: ERROR_CODE.FAIL});
        }
        res.send({
            errorCode: ERROR_CODE.SUCCESS,
            data: account
        });
    });
});

router.post('/add', function(req, res, next) {
    var gameId = req.query.gameId;
    var body = {
        email: req.body.email,
        password: md5(req.body.password),
        role: req.body.role
    };
    Accounts.getModel(gameId).findOneAndUpdate({email: body.email}, body, {upsert: true, new: true, runValidators: true}, function(err, acc){
        if(err) {
            return res.send({errorCode: ERROR_CODE.FAIL});
        }
        if(acc == null){
            return res.send({errorCode: ERROR_CODE.NOT_FOUND});
        }
        res.send({
            errorCode: ERROR_CODE.SUCCESS,
            data: acc
        })
    });;
});
module.exports = router;