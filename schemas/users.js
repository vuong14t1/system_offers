var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var users = new Schema({
    userId:{
        type: Number,
        default: -1,
        require: true
    },
    groupObject: {
        type: Schema.Types.ObjectId,
        ref: 'group_object'
    },
    channelPayment: [
        {
            channel: {
                type: String,
                default: "IAP"
            },
            cost: {
                type: Number,
                default: 0
            },
            number: {
                type: Number,
                default: 0
            }
        }
    ],

    totalGame: {
        type: Number,
        default: 0
    },

    lastPaidPack: {
        type: Number,
        default: 0
    },

    timeCreateAccount: {
        type: Number,
        default: Date.now()
    },

    lastTimeOnline: {
        type: Number,
        default: Date.now()
    },

    isModifiedOffer: {
       type: Boolean,
       default: false
    }
});


module.exports = users;