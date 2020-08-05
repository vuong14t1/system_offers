var kafka = require('kafka-node');
var conf = require("../conf/kafka_config.json")[process.env.MODE_BUILD];
var client = new kafka.KafkaClient({kafkaHost: conf.server});
var Consumer = kafka.Consumer;
var logger = require('../methods/winston');
var handleReceiveMessage = require("./handle_receive_message");
var consumer
try{
    client.createTopics(conf.createTopic, (error, result) => {
        // result is an array of any errors if a given topic could not be created
        if(error) {
            logger.getLogger().info("create topic error " + error);
        }else{
            logger.getLogger().info("create topic success " + JSON.stringify(result));
            logger.getLogger().info("create consumer " + JSON.stringify(conf.topic));
            consumer = new Consumer(client, conf.topic,{
                autoCommit: true
            });
            var intervalReconnect = -1;
            var durationReconnect = 3000;
            consumer.on('ready', function () {
                logger.getLogger().info("ready to kafka");
            });
            consumer.on('message', async function (message) {
                intervalReconnect && clearInterval(intervalReconnect);
                if(message.key == null) {
                    logger.getLogger().info("receive message with key null" + JSON.stringify(message));
                    return;
                }
                var arrKey = message.key.split("|");
                var gameId = arrKey[0];
                logger.getLogger("kafka_" + gameId).info("receive message from kafka: " + JSON.stringify(message));
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
                        logger.getLogger().info("receive from kafka action " + action);
                    break;
                }
            })
            consumer.on('error', function (err) {
                logger.getLogger().info("consumer kafka error: " + JSON.stringify(err));
                // doReconnect();
            });
        }
    });
}catch(err) {
    logger.getLogger(gameId).info("Create topic kafka error: " + err);
}



function doReconnect() {
    intervalReconnect && clearInterval(intervalReconnect);
    intervalReconnect = setInterval(function () {
        consumer.close();
        client.close();
        logger.getLogger().info("reconnecting to kafka....");
        client = new kafka.KafkaClient({kafkaHost: conf.server});
        consumer = new Consumer(client, conf.topic,{
            autoCommit: true
        });
    }, durationReconnect);
}
module.exports = this;