var ROLE = require("../const/role_const");
var Accounts = require("../models/accounts");
var md5 = require('md5');
var conf_games = require('../conf/register_games.json')
var logger = require('../methods/winston');
//seed account from config register game
async function seedAccounts () {
    for(var i in conf_games){
        var gameId = i;
        var super_admins = conf_games[i]['accounts'];
        for await(let user of super_admins) {
            user.password = md5(user.password);
            await Accounts.getModel(gameId).findOne({email: user.email}).exec(async function (err, account) {
                if(account == null) {
                 await Accounts.getModel(gameId).create(user, function (err, raw) {
                        if(raw) {
                            console.log("seed account success: " + JSON.stringify(raw));
                            logger.getLogger().info("seed account success: " + JSON.stringify(raw));
                        }
                    });
                }
            });
        
        }
    }
}

exports.seedAccounts = seedAccounts;