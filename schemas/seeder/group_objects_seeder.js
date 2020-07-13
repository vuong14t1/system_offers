const seeder = require('mongoose-seed');
const faker = require('faker');

let items = [];
for(i=0; i < 15; i++){
    items.push(
        {
            nameObject : faker.commerce.productName(),
            totalUser : faker.random.number(),
			totalGame : {
				from: faker.random.number(),
				to: faker.random.number()
			},
		
			// offerLive: {
			// 	type: Schema.Types.ObjectId,
			// 	ref: 'offer_live'
			// },
		
			channelPayment: faker.commerce.productName(),
		
			totalCost: {
				from: faker.random.number(),
				to: faker.random.number()
			},
		
			numberPay: {
				from: faker.random.number(),
				to: faker.random.number()
			},
		
			lastPaidPack: {
				from: faker.random.number(),
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
    'model': 'group_object',
    'documents': items
}]

// connect mongodb
seeder.connect('mongodb://localhost:27017/system_offers_1', function() {
  seeder.loadModels([
    'models/group_objects.js'  // load mongoose model 
  ]);
  seeder.clearModels(['group_object'], function() {
    seeder.populateModels(data, function() {
      seeder.disconnect();
    });
  });
});