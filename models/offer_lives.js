var mongoose = require('mongoose');
var offerLiveSchema = require('../schemas/offer_lives');
var OfferLives = mongoose.model('offer_live', offerLiveSchema);
module.exports = OfferLives;