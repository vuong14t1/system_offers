var mongoose = require('mongoose');
var groupOffersSchema = require('../schemas/group_offers');
var GroupOffers = mongoose.model('group_offer', groupOffersSchema);
module.exports = GroupOffers;