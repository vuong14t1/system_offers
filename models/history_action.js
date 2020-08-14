var mongoose = require('mongoose');
var historyActionsSchema = require('../schemas/history_action');
function getModel(gameId) {
    return mongoose.model(gameId + '_history_action', historyActionsSchema.getSchema(gameId));
}
module.exports.getModel = getModel;