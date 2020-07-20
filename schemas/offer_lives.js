var mongoose = require('mongoose');
var Schema = mongoose.Schema;
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
        
            timeStart: {
                type: Number,
                default: Date.now()
            },
        
            timeFinish: {
                type: Number,
                default: Date.now()
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
            }
        });
    }
    return schemaOfferLives[gameId];
}

module.exports.getSchema = getSchema;