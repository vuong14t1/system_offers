var mongoose = require('mongoose');
var groupObjectScheme = require('../schemas/group_objects');
var GroupObjects = mongoose.model('group_object', groupObjectScheme);
module.exports = GroupObjects;