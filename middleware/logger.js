import config from 'config';
import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';
import { format, transports, createLogger } from 'winston';

const { combine, timestamp, errors, prettyPrint, json, simple, colorize, align } = format;
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
		new transports.File({ filename: 'logs/http.log', level: 'http' })
	],
	exceptionHandlers: [new transports.File({ filename: 'logs/exception.log' })],
	rejectionHandlers: [new transports.File({ filename: 'logs/rejections.log' })]
});

// if (config.get('env') === 'development') {
// 	if (config.has('logtailSourceToken') && config.get('logtailSourceToken') !== '') {
// 		const logtail = new Logtail(config.get('logtailSourceToken'));
// 		logger.add(new LogtailTransport(logtail));
// 	}
// 	logger.add(
// 		new transports.Console({
// 			level: 'info',
// 			format: consoleFormat,
// 			handleExceptions: true,
// 			handleRejections: true
// 		})
// 	);
// }

export default logger;
