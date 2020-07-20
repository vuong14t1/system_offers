const seeder = require('mongoose-seed');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const async = require('async');
const faker = require('faker');
const _ = require('lodash');
const Users = require('../../models/users');
const GroupObject = require('../../models/group_objects');
var GAME = require('../../const/game_const');
var utils = require('../../methods/utils');
var CHANNEL_PAYMENT = require('../../const/channel_const')
let gameId = GAME.P13_NAME;

new Promise((resolve) => {
    mongoose.connect('mongodb://localhost:27017/system_offers_1', {
        // useMongoClient: true,
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
					// groupObject: _.sample(results[0])._id,
					channelPayment: [
						{
							channel: "IAP",
							cost: _.random(0, 1000000),
							number: _.random(0, 20)
						},
						{
							channel: "DCB",
							cost: _.random(0, 1000000),
							number: _.random(0, 20)
						},
						{
							channel: "CARD",
							cost: _.random(0, 1000000),
							number: _.random(0, 20)
						}

					],
				
					totalGame: _.random(0, 100000),
				
					lastPaidPack: _.random(0, 20),
				
					timeCreateAccount: utils.TimeUtility.getCurrentTime() - _.random(86400, 86400 * 20),
				
					lastTimeOnline: utils.TimeUtility.getCurrentTime() - _.random(86400, 86400 * 20),
					isModifiedOffer: false,
					channelGame: _.random(1, 4)
				}
			)
        }
        resolve(items);
    });
}).then((items) => {
    seeder.connect('mongodb://localhost:27017/system_offers_1', function() {
        let data = [{
			'model': gameId + '_user',
			'documents': items
		}]
        seeder.loadModels([
			'models/users.js'  // load mongoose model 
        ]);
        seeder.clearModels([gameId + '_user'], function() {
			seeder.populateModels(data, function() {
				console.log("done");
			  seeder.disconnect();
			});
		  });
     });
});