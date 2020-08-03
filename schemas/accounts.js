var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ROLE = require("../const/role_const");
var schemaAccounts = {};
function getSchema(gameId) {
    if(schemaAccounts[gameId] == null) {
        schemaAccounts[gameId] = new Schema({
            email: {
                type: String,
                default: "unknown",
                unique: true
            },
            password: {
                type: String,
                default: "123456@p13"
            },
            role: {
                type: Number,
                default: ROLE.VIEWER
            }
        });
        schemaAccounts[gameId].index({ email: -1});
    }
    return schemaAccounts[gameId];
}
module.exports.getSchema = getSchema;
