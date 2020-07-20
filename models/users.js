var mongoose = require('mongoose');
var userSchema = require('../schemas/users');
var CHEAT = require('../const/cheat_const')
function getModel(gameId) {
    return mongoose.model(gameId + '_user', userSchema.getSchema(gameId));
}
module.exports.getModel = getModel;
if(CHEAT.CHEAT_SEED){
module.exports = getModel("p13");
}
