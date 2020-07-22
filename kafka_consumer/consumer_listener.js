var kafka = require('kafka-node');
var conf = require("../conf/kafka_config.json");
var client = new kafka.KafkaClient({kafkaHost: conf.server});
var Consumer = kafka.Consumer;
var logger = require('../methods/winston');
var handleReceiveMessage = require("./handle_receive_message");
var consumer = new Consumer(client, conf.topic,{
    autoCommit: true
});
consumer.on('message', async function (message) {

    if(message.key == null) {
        console.log("receive kafka key " + message.key);
        return;
    }
    var arrKey = message.key.split("|");
    var gameId = arrKey[0];
    logger.getLogger(gameId).info("receive message from kafka: " + JSON.stringify(message));
    var action = arrKey[1];
    switch(action){
        case conf.action.action1:
            handleReceiveMessage.trackingUserLogin(gameId, message.value);
        break;
        case conf.action.action2:
            handleReceiveMessage.trackingStatsGame(gameId, message.value);
        break;
        case conf.action.action3:
            handleReceiveMessage.trackingPayment(gameId, message.value);
        break;
        case conf.action.action4:
            handleReceiveMessage.trackingBoughtOfferLive(gameId, message.value);
        break;
        default:
            console.log("receive from kafka action " + action);
        break;
    }
})
consumer.on('error', function (err) {
    console.log("kafka log error:  " + err);
});
module.exports = this;