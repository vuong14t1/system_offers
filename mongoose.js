var logger = require("./methods/winston");
var db_config = require("./conf/db_config.json");
var mongoose = require('mongoose');  
var seed_accounts = require("./seed_db/seed_accounts");
if(process.env.MODE_BUILD == null) {
	logger.getLogger().info("mode build config null");
	process.env.MODE_BUILD = "dev";
}
var conf = db_config[process.env.MODE_BUILD];
var host, port, username, password, database, url;
if (process.env.MODE_BUILD != 'dev') {
	host = conf['host'];
	port = conf['port'];
    username = conf['user_name'],  
    password = conf['password'],  
    database = conf['database'];
    url = "mongodb://" + host + ":" + port + "/" + database;
} else {
    host = conf['host'];
    database = conf['database'];
	port = conf['port'];
    url = "mongodb://" + host + ":" + port + "/" + database;
}
logger.getLogger().info("Connecting to " + url + "user nmae " + username + "| pass " + password);  
var recon = true;  
function getConnect(){  
	var opts ={  
	          db:{native_parser:true},  
	          server:{ poolSize:10, auto_reconnect:true },  
	          user: username,  
			  pass: password,
			  useCreateIndex : true,
			  useNewUrlParser: true,
			  useUnifiedTopology: true,
			  autoIndex : true,
			  useFindAndModify: false
	};  
	mongoose.connect(url, opts);  
	var dbcon = mongoose.connection;
	// var dbcon = mongoose.createConnection(url, opts);  
	dbcon.on('error',function(error){  
	    logger.getLogger().info("connect mongoose db error: " + error);    
		// throw new Error('disconnected,restart');  
		dbcon.close();  
	});  
	mongoose.set('debug', true);
	   
	dbcon.on('disconnected',function(){  
		console.log('disconnected');  
		logger.getLogger().info("connect mongoose db disconnected.");    
		dbcon.close();  
	});  
	dbcon.on('open',function(){  
		logger.getLogger().info("connect mongoose db success.");    
		recon = true;  
		seed_accounts.seedAccounts();
	});  
	dbcon.on('close',function(err){  
		logger.getLogger().info("connect mongoose db closed.");    
	// dbcon.open(host, dbName, port, opts, function() {  
	// console.log('closed-opening');  
	// });  
		reConnect('*');  
	});  
	function reConnect(msg){  
		logger.getLogger().info("reconnect mongoose " + msg);    
		if(recon){  
			logger.getLogger().info("==============reconnecting mongoose==============");
			dbcon.open(host, database, port, opts,function(){  
				logger.getLogger().info("reopen mongoose.");
			});  
		    recon = false;  
		};  
		logger.getLogger().info("==============reconnecting mongoose end==============");
	}	  
}  
   
exports.getConnect = getConnect;
exports.mongoose = mongoose;  