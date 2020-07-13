var ROLE = require("../const/role_const");
var Accounts = require("../models/accounts");
var md5 = require('md5');
async function seedAccounts () {
    var gameId = "p13";
    var super_admins = [
        {
            email: "vuongpq2",
            password: "123456@p13",
            role: ROLE.SUPER_ADMIN
		},
		{
            email: "duyenxinhdep",
            password: "123456@p13",
            role: ROLE.SUPER_ADMIN
        }
    ];
    for await(let user of super_admins) {
        user.password = md5(user.password);
        console.log("vao day " + user.email);
        await Accounts.getModel(gameId).findOne({email: user.email}, async function (err, account) {
            if(account == null) {
             await Accounts.getModel(gameId).create(user, function (err, raw) {
                    if(raw) {
                        console.log("seed account " + JSON.stringify(raw));
                    }
                });
            }
        });
    
    }
}

exports.seedAccounts = seedAccounts;