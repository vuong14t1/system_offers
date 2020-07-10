const group_offers = require('./group_offers_seeder');
const group_objects = require('./group_objects_seeder');
const offer_lives = require('./offer_lives_seeder');
const users = require('./users_seeder');

async function dbseed() {
    await group_offers();
    await group_objects();
    await offer_lives();
    await users();
    console.log('data generated successfully');
}