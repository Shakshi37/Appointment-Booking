const { config } = require('winston')
const winston = require('winston')

const format = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.errors({ stack: true }),
  winston.format.cli({ colors: { info: 'cyan', debug: 'yellow'} }),
  winston.format.errors({ stack: false }),
  winston.format.json(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms A' }),
  winston.format.printf(info => `${info.timestamp} : ${info.level} -${info.message}`)

)

const logger = winston.createLogger({
  levels: config.syslog.levels,
  defaultMeta: { component: 'user-service' },
  transports: [new winston.transports.Console({
    format: format,
    level: 'error',
    level: 'info',
    // level: 'debug'
  })]
})

logger.stream = {
  write: function (message, encoding) {
    // use the 'info' log level so the output will be picked up by both
    // transports (file and console)
    logger.info(message);
  },
};



module.exports = logger



