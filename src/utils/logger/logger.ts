import winston from 'winston';

const format = winston.format.combine(
  winston.format.timestamp({
    format: 'HH:mm:ss.SSS',
  }),
  winston.format.colorize(),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  winston.format.printf(({ level, message, _label, timestamp }) => {
    return `${timestamp} [${level.padEnd(27, ' ')}] ${message}`;
  }),
);

const options: winston.LoggerOptions = {
  transports: [
    new winston.transports.Console({
      level: 'silly',
      format: winston.format.combine(winston.format.colorize(), format),
    }),
    new winston.transports.File({
      filename: 'logs/debug.log',
      level: 'debug',
    }),
  ],
};

const logger = winston.createLogger(options);

// if (process.env.NODE_ENV !== 'production') {
//   logger.debug('Logging initialized at debug level');
// }

export { logger };
