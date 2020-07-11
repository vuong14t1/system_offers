var mongoose = require('mongoose');
var userSchema = require('../schemas/users');
function getModel(gameId) {
    return mongoose.model(gameId + '_users', userSchema.getSchema(gameId));
}
module.exports.getModel = getModel;