const { Logtail } = require('@logtail/node');
const { LogtailTransport } = require('@logtail/winston');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, errors, prettyPrint, json, simple, colorize, printf, align } = format;
const config = require('config');
const logtail = new Logtail(config.get('logtailSourceToken'));

const consoleFormat = combine(
	colorize({ all: true }),
	align(),
	prettyPrint(),
	timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
	simple()
);
const logger = createLogger({
	level: process.env.LOG_LEVEL || 'http',
	format: combine(
		errors({ stack: true }),
		timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
		json()
	),
	defaultMeta: { service: 'user-service' },
	transports: [
		new transports.File({ filename: 'logs/error.log', level: 'error' }),
		new transports.File({ filename: 'logs/combined.log', level: 'info' }),
		new transports.File({ filename: 'logs/http.log', level: 'http' }),
		new LogtailTransport(logtail)
	],
	exceptionHandlers: [new transports.File({ filename: 'logs/exception.log' })],
	rejectionHandlers: [new transports.File({ filename: 'logs/rejections.log' })]
});
const loggerTest = createLogger({
	level: process.env.LOG_LEVEL || 'http',
	format: combine(
		errors({ stack: true }),
		timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
		json()
	),
	defaultMeta: { service: 'user-service' },
	transports: [
		new transports.File({ filename: 'logs/testing.log', level: 'error' }),
		new transports.File({ filename: 'logs/testing.log', level: 'info' }),
		new transports.File({ filename: 'logs/testing.log', level: 'http' })
	],
	exceptionHandlers: [new transports.File({ filename: 'logs/testing.log' })],
	rejectionHandlers: [new transports.File({ filename: 'logs/testing.log' })]
});
if (config.get('env') === 'development')
	logger.add(
		new transports.Console({
			level: 'info',
			format: consoleFormat,
			handleExceptions: true,
			handleRejections: true
		})
	);

module.exports = config.get('env') === 'test' ? loggerTest : logger;
