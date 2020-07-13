var mongoose = require('mongoose');
var offerLiveSchema = require('../schemas/offer_lives');
function getModel(gameId) {
    return mongoose.model(gameId + '_offer_live', offerLiveSchema.getSchema(gameId))
}
module.exports.getModel = getModel;
// module.exports = getModel("p13");