var mongoose = require('mongoose');
var groupOffersSchema = require('../schemas/group_offers');
function getModel(gameId) {
    return mongoose.model(gameId + '_group_offer', groupOffersSchema.getSchema(gameId));
}
module.exports.getModel = getModel;
// module.exports = getModel("p13");