var mongoose = require('mongoose');
var accountSchema = require('../schemas/accounts');
function getModel(gameId){
    var model = mongoose.model(gameId + '_account', accountSchema.getSchema(gameId));
    model.on('index', function(error) {
        // "_id index cannot be sparse"
        console.log(error);
    });
    return model;
}
module.exports.getModel = getModel;
