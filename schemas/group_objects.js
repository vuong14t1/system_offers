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

const seeder = require('mongoose-seed');
const faker = require('faker');

let items = [];
for(i=0; i < 15; i++){
    items.push(
        {
            nameObject : faker.commerce.productName(),
            totalUser : faker.lorem.number(),
            totalGame : faker.random.number()
        }
    )
}

let data = [{
    'model': 'group_objects',
    'documents': items
}]

console.log(data);

// connect mongodb
seeder.connect('mongodb://localhost:27017/system_offers_1', function() {
  seeder.loadModels([
    '../../model/group_objects'  // load mongoose model 
  ]);
  seeder.clearModels(['group_objects'], function() {
    seeder.populateModels(data, function() {
      seeder.disconnect();
    });
  });
});