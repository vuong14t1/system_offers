
const seeder = require('mongoose-seed');
const faker = require('faker');
var GAME = require('../../const/game_const');
let gameId = GAME.P13_NAME;
let items = [];
for(i=0; i < 15; i++){
    items.push(
        {
			nameOffer: faker.commerce.productName(),
			durationLive: faker.random.number(),
			durationCountDown: faker.random.number(),
			description: faker.commerce.productName(),
			type: faker.random.number(),
			value: faker.random.number(),
			originalCost: faker.random.number(),
			promotionCost: faker.random.number()
        }
    )
}

let data = [{
    'model': gameId + '_group_offer',
    'documents': items
}]

// connect mongodb
seeder.connect('mongodb://localhost:27017/system_offers_1', function() {
  seeder.loadModels([
    'models/group_offers.js'  // load mongoose model 
  ]);
  seeder.clearModels([gameId + '_group_offer'], function() {
    seeder.populateModels(data, function() {
      seeder.disconnect();
    });
  });
});