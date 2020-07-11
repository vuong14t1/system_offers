var mongoose = require('mongoose');
var accountSchema = require('../schemas/accounts');
var Accounts = mongoose.model('account', accountSchema);
module.exports = Accounts;
