var mongoose = require('mongoose');
var accountSchema = require('../schemas/accounts');
function getModel(gameId){
    return mongoose.model(gameId + '_account', accountSchema.getSchema(gameId));
}
module.exports.getModel = getModel;
