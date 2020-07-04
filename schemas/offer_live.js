var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var offer_live = new Schema({
    groupOfferId: {
        type: Schema.Types.ObjectId,
        ref: 'group_offer'
    },
    groupObjectId: {
        type: Schema.Types.ObjectId,
        ref: 'group_object'
    },

    timeStart: {
        type: Number,
        default: Date.now()
    },

    timeFinish: {
        type: Number,
        default: Date.now()
    },

    totalBought: {
        type: Number,
        default: 0
    },

    totalShow: {
        type: Number,
        default: 0
    }
});