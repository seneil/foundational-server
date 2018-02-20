const { createLogger, format, transports } = require('winston');

const { combine, printf } = format;

const printFormat = printf(info => `${info.level}: ${info.message}`);

const logger = createLogger({
  level: 'info',
  transports: [new transports.Console()],
  format: combine(
    format.colorize({ all: true }),
    format.splat(),
    printFormat,
  ),
});

module.exports = logger;
