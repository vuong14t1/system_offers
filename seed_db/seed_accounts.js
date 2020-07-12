var ROLE = require("../const/role_const");
var Accounts = require("../models/accounts");
var md5 = require('md5');
function seedAccounts () {
    var gameId = "p13";
    var super_admins = [
        {
            email: "vuongpq2",
            password: "123456@p13",
            role: ROLE.SUPER_ADMIN
        }
    ];
    for(var i in super_admins) {
        super_admins[i].password = md5(super_admins[i].password);
        Accounts.getModel(gameId).findOne({email: super_admins[i].email}, function (err, account) {
            if(account == null) {
                Accounts.getModel(gameId).create(super_admins[i], function (err, raw) {
                    if(raw) {
                        console.log("seed account " + JSON.stringify(raw));
                    }
                });
            }
        });
    }
}

exports.seedAccounts = seedAccounts;