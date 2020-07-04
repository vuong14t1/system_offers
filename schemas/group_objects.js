var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var group_objects = new Schema({
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

    amountPay: {
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
    }

});

module.exports = group_objects;