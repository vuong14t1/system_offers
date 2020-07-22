const winston = require('winston');
require('winston-daily-rotate-file');

var globalLogger = {};
function getLogger(gameId) {
  gameId =  gameId === undefined? "common": gameId;
  if(globalLogger[gameId] == null) {
    var transport = new winston.transports.DailyRotateFile({
      filename: 'system-offers-%DATE%.log',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '120m',
      maxFiles: '15d',
      dirname: "./logs/" + gameId
    });
    
    transport.on('rotate', function(oldFilename, newFilename) {
      // do something fun
    });
    
    var logger = winston.createLogger({
      // format của log được kết hợp thông qua format.combine
      format: winston.format.combine(
        winston.format.splat(),
        // Định dạng time cho log
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        // thêm màu sắc
        winston.format.colorize(),
        // thiết lập định dạng của log
        winston.format.printf(
          log => {
            // nếu log là error hiển thị stack trace còn không hiển thị message của log 
            if(log.stack) return `[${log.timestamp}] [${log.level}] ${log.stack}`;
            return  `[${log.timestamp}] [${log.level}] ${log.message}`;
          },
        ),
      ),
      transports: [
        transport
      ],
    })
    
    if (process.env.MODE_BUILD == 'dev') {
      logger.add(new winston.transports.Console({
        format: winston.format.simple()
      }));
    }
    globalLogger[gameId] = logger;
  }
  return globalLogger[gameId];
}

module.exports.getLogger = getLogger;