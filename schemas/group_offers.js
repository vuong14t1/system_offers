var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var utils = require("../methods/utils");
var schemaGroupOffers = {};
function getSchema(gameId) {
    if(schemaGroupOffers[gameId] == null) {
        schemaGroupOffers[gameId] = new Schema({
            nameOffer: String,
            description: String,
            type: Number,
            value: Number,
            items: {
                type: Array,
                default: []
            },
            originalCost: Number,
            promotionCost: Number,
            createAt: {
                type: Number,
                default: utils.TimeUtility.getCurrentTime(gameId),
                require: true
            },
        });
    }
    return schemaGroupOffers[gameId];
}
module.exports.getSchema = getSchema;