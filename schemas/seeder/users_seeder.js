const seeder = require('mongoose-seed');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const async = require('async');
const faker = require('faker');
const _ = require('lodash');
const Users = require('../../models/users');
const GroupObject = require('../../models/group_objects');


new Promise((resolve) => {
    mongoose.connect('mongodb://localhost:27017/system_offers_1', {
        useMongoClient: true,
        promiseLibrary: require('bluebird')
    });
    async.parallel([
        (callback) => {
            GroupObject.find({}, { _id : 1 })
            .exec((err, groupObject) => {
                callback(null, groupObject);
            }); 
        },
    ], 
    (err, results) => {
        resolve(results);
        mongoose.connection.close();
    });
}).then((results) => {
    return new Promise((resolve) => {
        let items = [];
        for(i=0; i< 150; i++){
            items.push(
				{
					userId: faker.random.number(),
					groupObject: _.sample(results[0])._id,
					channelPayment: [
						{
							channel: "IAP",
							cost: faker.random.number(),
							number: faker.random.number()
						}
					],
				
					totalGame: faker.random.number(),
				
					lastPaidPack: faker.random.number(),
				
					timeCreateAccount: faker.random.number(),
				
					lastTimeOnline: faker.random.number(),
					isModifiedOffer: false,
					channelGame: faker.random.number()
				}
			)
        }
        resolve(items);
    });
}).then((items) => {
    seeder.connect('mongodb://localhost:27017/system_offers_1', function() {
        let data = [{
			'model': 'user',
			'documents': items
		}]
        seeder.loadModels([
			'models/users.js'  // load mongoose model 
        ]);
        seeder.clearModels(['user'], function() {
			seeder.populateModels(data, function() {
			  seeder.disconnect();
			});
		  });
     });
});