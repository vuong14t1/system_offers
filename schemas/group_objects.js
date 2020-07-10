var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var group_objects = new Schema({
    nameObject: {
        type: String,
        default: "default"
    },
    offerLive: {
        type: Schema.Types.ObjectId,
        ref: 'offer_live'
    },

    totalUser: {
        type: Number,
        default: 0
    },
    totalGame: {
        from: Number,
        to: Number
    },

    channelPayment: {
        type: String
    },

    totalCost: {
        from: Number,
        to: Number
    },

    numberPay: {
        from: Number,
        to: Number
    },

    lastPaidPack: {
        from: Number,
        to: Number
    },

    age: {
        from: Number,
        to: Number
    },

    timeLastOnline: {
        from: Number,
        to: Number
    },

    channelGame: {
        from: Number,
        to: Number
    }

});

module.exports = group_objects;

