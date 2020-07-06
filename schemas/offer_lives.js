var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var offer_lives = new Schema({
    groupOffer: {
        type: Schema.Types.ObjectId,
        ref: 'group_offer'
    },
    
    groupObject: {
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

module.exports = offer_lives;