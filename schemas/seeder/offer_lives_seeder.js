const seeder = require('mongoose-seed');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const async = require('async');
const faker = require('faker');
const _ = require('lodash');
const GroupOffer = require('../../models/group_offers');
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
		(callback) => {
            GroupOffer.find({}, { _id : 1 })
            .exec((err, groupOffer) => {
                callback(null, groupOffer);
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
					groupOffer: _.sample(results[1])._id,
					
					groupObject: _.sample(results[0])._id,
				
					timeStart: faker.random.number(),
				
					timeFinish: faker.random.number(),
				
					totalBought: faker.random.number(),
				
					totalShow: faker.random.number(),
				}
			)
        }
        resolve(items);
    });
}).then((items) => {
    seeder.connect('mongodb://localhost:27017/system_offers_1', function() {
        let data = [{
			'model': 'offer_live',
			'documents': items
		}]
        seeder.loadModels([
			'models/offer_lives.js'  // load mongoose model 
        ]);
        seeder.clearModels(['offer_live'], function() {
			seeder.populateModels(data, function() {
			  seeder.disconnect();
			});
		  });
     });
});