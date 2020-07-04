var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var group_offers = new Schema({
    nameOffer: String,
    durationLive: Number,
    durationCountDown: Number,
    description: String,
    type: Number,
    value: Number,
    originalCost: Number,
    promotionCost: Number
});
module.exports = group_offers;