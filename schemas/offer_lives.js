var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var utils = require("../methods/utils");
var schemaOfferLives = {};
function getSchema(gameId) {
    if(schemaOfferLives[gameId] == null) {
        schemaOfferLives[gameId] = new Schema({
            groupOffer: {
                type: Schema.Types.ObjectId,
                ref: gameId + '_group_offer',
                default: null
            },
            
            groupObject: {
                type: Schema.Types.ObjectId,
                ref: gameId + '_group_object',
                default: null
            },

            isExpired: {
                type: Boolean,
                default: false
            },
        
            timeStart: {
                type: Number,
                default: utils.TimeUtility.getCurrentTime(gameId)
            },
        
            timeFinish: {
                type: Number,
                default: utils.TimeUtility.getCurrentTime(gameId)
            },
        
            totalBought: {
                type: Number,
                default: 0
            },
        
            totalShow: {
                type: Number,
                default: 0
            },
            
            totalReceived: {
                type: Number,
                default: 0
            },

            createAt: {
                type: Number,
                default: utils.TimeUtility.getCurrentTime(gameId),
                require: true
            },
        });
    }
    return schemaOfferLives[gameId];
}

module.exports.getSchema = getSchema;