var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schemaUsers = {};
var utils = require('../methods/utils');
function getSchema(gameId) {
    if(schemaUsers[gameId] == null) {
        schemaUsers[gameId] = new Schema({
            userId:{
                type: Number,
                default: -1,
                require: true
            },
            groupObject: {
                type: Schema.Types.ObjectId,
                ref: gameId + '_group_object',
                default: null 
            },
            channelPayment: {
                type: Array,
                default:utils.Utility.getDefaultSchema()
            },
        
            totalGame: {
                type: Number,
                default: 0
            },
        
            lastPaidPack: {
                type: Number,
                default: 0
            },
        
            timeCreateAccount: {
                type: Number,
                default: Date.now()
            },
        
            lastTimeOnline: {
                type: Number,
                default: Date.now()
            },
        
            isModifiedOffer: {
               type: Boolean,
               default: false
            },
        
            channelGame: {
                type: Number,
                default: 1
            }
        });
    }
    
    return schemaUsers[gameId];
}

module.exports.getSchema = getSchema;