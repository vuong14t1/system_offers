const seeder = require('mongoose-seed');
const faker = require('faker');
const Users = require('../../models/users');


let items = [];
for(i=0; i < 15; i++){
    items.push(
        {
			userId:faker.random.number,
			// groupObject: {
			// 	type: Schema.Types.ObjectId,
			// 	ref: 'group_object'
			// },
			channelPayment: [
				{
					channel: "IAP",
					cost: faker.random.number,
					number: faker.random.number
				}
			],
		
			totalGame: faker.random.number,
		
			lastPaidPack: faker.random.number,
		
			timeCreateAccount: faker.random.number,
		
			lastTimeOnline: faker.random.number,
			isModifiedOffer: false,
			channelGame: faker.random.number
        }
    )
}

let data = [{
    'model': 'user',
    'documents': items
}]

// connect mongodb
seeder.connect('mongodb://localhost:27017/system_offers_1', function() {
  seeder.loadModels([
    'models/users.js'  // load mongoose model 
  ]);
  seeder.clearModels(['user'], function() {
    seeder.populateModels(data, function() {
      seeder.disconnect();
    });
  });
});