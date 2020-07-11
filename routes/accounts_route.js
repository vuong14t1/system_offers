var express = require('express');
var router = express.Router();
var ERROR_CODE = require('../const/error_code');
var Accounts = require("../models/accounts");
var md5 = require('md5');
const ROLE = require('../const/role_const');
router.use('/delete',function timeLog (req, res, next) {
    console.log('Time: ', Date.now())
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
    console.log('Time: ', Date.now())
    if(!req.session.loggedIn) {
        res.send({
            errorCode: ERROR_CODE.NOT_LOGIN
        });
        return;
    }
    next()
    
})

router.post("/login", function (req, res, next) {
    var body = {
        email: req.body.email,
        password: md5(req.body.password)
    };
    Accounts.findOne({email: body.email, password: body.password}, function (err, account) {
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
    Accounts.find({}, function (err, accounts) {
        res.send({
            errorCode: ERROR_CODE.SUCCESS,
            data: accounts
        });
    });
});

router.post('/delete', function (req, res, next) {
    var body = {
        idAccount: req.body.idAccount
    };
    Accounts.findByIdAndRemove(body.idAccount, function (err) {
        res.send({
            errorCode: ERROR_CODE.SUCCESS
        });
    });
});
module.exports = router;