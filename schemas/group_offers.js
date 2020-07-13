var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schemaGroupOffers = {};
function getSchema(gameId) {
    if(schemaGroupOffers[gameId] == null) {
        schemaGroupOffers[gameId] = new Schema({
            nameOffer: String,
            durationLive: Number,
            durationCountDown: Number,
            description: String,
            type: Number,
            value: Number,
            originalCost: Number,
            promotionCost: Number
        });
    }
    return schemaGroupOffers[gameId];
}
module.exports.getSchema = getSchema;