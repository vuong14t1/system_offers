var express = require('express');
var router = express.Router();
var utils = require('../methods/utils');

var Users = require('../models/users');
const ERROR_CODE = require('../const/error_code');

router.get('/server_time', function(req, res, next) {
    var gameId = req.query.gameId;
	let serverTime = utils.TimeUtility.getCurrentTime(gameId);
	console.log("server_time ", serverTime);
	res.send({
		errorCode: ERROR_CODE.SUCCESS,
		data: {
			serverTime: serverTime
		}
	})
});

module.exports = router;