var mongoose = require('mongoose');
var offerLiveSchema = require('../schemas/offer_live');
var OfferLives = mongoose.model('offer_live', offerLiveSchema);
module.exports = OfferLives;