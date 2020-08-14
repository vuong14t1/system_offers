var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var utils = require("../methods/utils");
var schemaHistoryActions = {};
function getSchema(gameId) {
    if(schemaHistoryActions[gameId] == null) {
        schemaHistoryActions[gameId] = new Schema({
            createAt: {
                type: Number,
                default: utils.TimeUtility.getCurrentTime(gameId)
            },
            author: {
                type: String,
                default: "unknown"
            },
            msg: {
                type: String,
                default: "unknown"
            },
            tab: {
                type: Number,
                default: -1
            }
        });
    }
    return schemaHistoryActions[gameId];
}
module.exports.getSchema = getSchema;