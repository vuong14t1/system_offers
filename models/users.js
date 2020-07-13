var mongoose = require('mongoose');
var userSchema = require('../schemas/users');
function getModel(gameId) {
	console.log("cccc " , gameId);
    return mongoose.model(gameId + '_user', userSchema.getSchema(gameId));
}
module.exports.getModel = getModel;
// module.exports = getModel("p13");