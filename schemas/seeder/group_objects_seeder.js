const seeder = require('mongoose-seed');
const faker = require('faker');
var GroupObjects = require("../../models/group_objects");
var GAME = require('../../const/game_const');
let gameId = GAME.P13_NAME;
let items = [];
for(i=0; i < 15; i++){
    items.push(
        {
            nameObject : faker.commerce.productName(),
            totalUser : faker.random.number(),
			totalGame : {
				from: _.random(0, 10000),
				to: _.random(10, 100000)
			},
		
			// offerLive: {
			// 	type: Schema.Types.ObjectId,
			// 	ref: 'offer_live'
			// },
		
			channelPayment: faker.commerce.productName(),
		
			totalCost: {
				from: _.random(0, 10000000),
				to: _.random(from, 10000000),
			},
		
			numberPay: {
				from: _.random(0, 20),
				to: _.random(from, 100)
			},
		
			lastPaidPack: {
				from: _.random(0, 10000000),
				to: faker.random.number()
			},
		
			age: {
				from: faker.random.number(),
				to: faker.random.number()
			},
		
			timeLastOnline: {
				from: faker.random.number(),
				to: faker.random.number()
			},
		
			channelGame: {
				from: faker.random.number(),
				to: faker.random.number()
			}
			
        }
    )
}

let data = [{
    'model': gameId + '_group_object',
    'documents': items
}]

// connect mongodb
seeder.connect('mongodb://localhost:27017/system_offers_1', function() {
  seeder.loadModels([
    'models/group_objects.js' // load mongoose model 
  ]);
  seeder.clearModels([gameId + '_group_object'], function() {
    seeder.populateModels(data, function() {
		console.log('aaa')
      seeder.disconnect();
    });
  });
});