var mongoose = require('mongoose');
var groupObjectScheme = require('../schemas/group_objects');
var CHEAT = require('../const/cheat_const')
autoIncrement = require('mongoose-auto-increment');
function getModel(gameId) {
	// console.log("...." , mongoose.model(gameId + '_group_object', groupObjectScheme.getSchema(gameId)));
	// console.log("......." , mongoose.modelNames());
	return mongoose.model(gameId + '_group_object', groupObjectScheme.getSchema(gameId));
} 
function getModelName(){
	return mongoose.modelNames();
}
module.exports.getModel = getModel;
if(CHEAT.CHEAT_SEED){
	module.exports = getModel("p13");
}