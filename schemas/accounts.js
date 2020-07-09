var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ROLE = require("../const/role_const");
var accounts = new Schema({
    email: {
        type: String,
        default: "unknown"
    },
    password: {
        type: String,
        default: "123456@p13"
    },
    role: {
        type: Number,
        default: ROLE.VIEWER
    }
});

module.exports = accounts;
