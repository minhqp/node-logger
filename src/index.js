const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const colorizer = winston.format.colorize();

const LEVEL = {
  error: 'error',
  warn: 'warn',
  info: 'info',
  debug: 'debug',
};

const COLOR = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'white',
};
winston.addColors(COLOR);

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.printf((info) => {
        const cloneInfo = { ...info };
        delete cloneInfo.timestamp;
        delete cloneInfo.level;
        delete cloneInfo.message;

        const defaultText = colorizer.colorize(
          info.level,
          `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`,
        );

        return Object.keys(cloneInfo).length
          ? `${defaultText}\n${JSON.stringify(cloneInfo, null, 4)
              .split('\n')
              .map((e) => `    ${e}`)
              .join('\n')}`
          : defaultText;
      }),
    ),
  }),
  new DailyRotateFile({
    dirname: 'logs',
    filename: '%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    format: winston.format.printf((info) => {
      const fields = {
        '@timestamp': new Date().toISOString(),
        'log.level': info.level.toUpperCase(),
        message: '',
        ...info,
      };
      delete fields.level;

      return JSON.stringify(fields);
    }),
  }),
];

const logger = winston.createLogger({
  level: LEVEL.debug,
  transports,
});

module.exports = logger;
