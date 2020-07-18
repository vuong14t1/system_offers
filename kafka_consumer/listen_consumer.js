var kafka = require('kafka-node');
var client = new kafka.KafkaClient({kafkaHost:'localhost:9092'});
var Consumer = kafka.Consumer;
var handleReceiveMessage = require("./handle_receive_message");
var consumer = new Consumer(client, [
    {
        topic: "p13_action_2",
        partition: 0
    }
],{
    autoCommit: true
});
consumer.on('message', async function (message) {
    console.log("==================== " + JSON.stringify(message));
    if(message.key == null) {
        console.log("receive kafka key " + message.key);
        return;
    }
    var arrKey = message.key.split("|");
    var gameId = arrKey[0];
    var action = arrKey[1];
    switch(action){
        case "user_login":
            handleReceiveMessage.trackingUserLogin(gameId, message.value);
        break;
        case "stats_game":
            handleReceiveMessage.trackingStatsGame(gameId, message.value);
        break;
        case "user_payment":
            handleReceiveMessage.trackingPayment(gameId, message.value);
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