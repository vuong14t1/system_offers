require('dotenv').config();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
// var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var mongoose1 = require('./mongoose');
require("./kafka_consumer/consumer_listener");
const cors = require('cors');
var logger = require('./methods/winston');
var Accounts = require("./models/accounts");
var utils = require('./methods/utils');
utils.SchemaUtility.loadAllSchema();
const EventEmitter = require('events');
const myEmitter = new EventEmitter();
// increase the limit
myEmitter.setMaxListeners(50);
const fileUpload = require('express-fileupload');

var app = express();
app.use(fileUpload());
app.use(cors({
	credentials: true,
	origin: process.env.MODE_BUILD == "dev" ? process.env.API_CLIENT_DEV: process.env.API_CLIENT_RELEASE
  }));
  console.log('============================== ' + (process.env.MODE_BUILD == "dev" ? process.env.API_CLIENT_DEV: process.env.API_CLIENT_RELEASE));

var contains = require('./methods/array_contains');
var users_route = require('./routes/users_route');
var group_objects_route = require('./routes/group_objects_route');
var group_offers_route = require('./routes/group_offers_route');
var offer_lives_route = require('./routes/offer_lives_route');
var accounts_route = require('./routes/accounts_route');
var danger_route = require('./routes/danger_route');
var history_action_route = require('./routes/history_action_route');
var utils_route = require('./routes/utils_route');


app.locals.moment = require('moment');
app.locals.contains = contains;

mongoose1.getConnect();
// mongoose.pluralize(null);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
require('events').EventEmitter.defaultMaxListeners = 15;
app.use(session({
  secret: 'system_offer',
  resave:false,
  saveUninitialized:false, 
  cookie: { maxAge: 36000000000 },
  store:new MongoStore({
            mongooseConnection: mongoose1.mongoose.connection 
            })
}));

app.use(function(req, res, next){
  var gameId = req.query.gameId;
  if(gameId == null || !utils.SchemaUtility.isRegisteredGame(gameId)) {
    logger.getLogger().info("gameId " + gameId + " not registerd in service.");
      return res.send({
        errorCode: ERROR_CODE.NOT_FOUND_GAME_ID
      });
  }
  if(req.session.loggedIn){
    res.locals.authenticated = true;
    Accounts.getModel(gameId).findById(req.session.loggedIn, function(err, doc){
        if(err) return next(err);
        res.locals.me = doc;
    });
		next();
  } else {
    res.locals.authenticated = false;
    next();
  }
});

// app.use('/', index);
app.use('/tracking_user', users_route);
app.use('/group_objects', group_objects_route);
app.use('/group_offers', group_offers_route);
app.use('/offer_lives', offer_lives_route);
app.use('/accounts_route', accounts_route);
app.use('/danger_route', danger_route);
app.use('/utils_route', utils_route);
app.use('/history_action_route', history_action_route);


// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


var debug = require('debug')('node_mongodb_blog_system:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '10060');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

var serverSocket = require('./websocket/server_socket');
const ERROR_CODE = require('./const/error_code');
serverSocket(server);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}


