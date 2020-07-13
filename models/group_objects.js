var mongoose = require('mongoose');
var groupObjectScheme = require('../schemas/group_objects');
function getModel(gameId) {
    return mongoose.model(gameId + '_group_object', groupObjectScheme.getSchema(gameId));
}
module.exports.getModel = getModel;