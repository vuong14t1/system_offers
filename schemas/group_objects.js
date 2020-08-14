var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var utils = require("../methods/utils");
var schemaGroupObject = {};
function getSchema(gameId) {
    if(schemaGroupObject[gameId] == null) {
        schemaGroupObject[gameId] = new Schema({
            nameObject: {
                type: String,
                default: "default"
            },
            offerLive: {
                type: Schema.Types.ObjectId,
                ref: gameId + '_offer_live',
                default: null
            },
        
            totalUser: {
                type: Number,
                default: 0
            },

            // totalCurrentUser: {
            //     type: Number,
            //     default: 0
            // },
            
            totalGame: {
                from: Number,
                to: Number
            },
        
            channelPayment: {
                type: Array,
                default: []
            },
        
            totalCost: {
                from: Number,
                to: Number
            },
        
            numberPay: {
                from: Number,
                to: Number
            },
        
            lastPaidPack: {
                type: Array,
                default: []
            },
        
            age: {
                from: Number,
                to: Number
            },
        
            timeLastOnline: {
                from: Number,
                to: Number
            },
        
            channelGame: {
                from: Number,
                to: Number
            },
            createAt: {
                type: Number,
                default: utils.TimeUtility.getCurrentTime(gameId),
                require: true
            },
            seq: { type: Number, default: 0 }
        });
    }
    
    return schemaGroupObject[gameId];
}

module.exports.getSchema = getSchema;