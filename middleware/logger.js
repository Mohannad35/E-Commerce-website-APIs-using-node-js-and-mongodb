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
	exceptionHandlers: [new transports.Console({ format: consoleFormat })],
	rejectionHandlers: [new transports.Console({ format: consoleFormat })]
});

if (process.env.NODE_ENV === 'development') {
	if (process.env.LOGTAIL_SOURCE_TOKEN && process.env.LOGTAIL_SOURCE_TOKEN !== '') {
		const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN);
		logger.add(new LogtailTransport(logtail));
	}
	logger.add(
		new transports.Console({
			level: 'info',
			format: consoleFormat,
			handleExceptions: true,
			handleRejections: true
		})
	);
	logger.add(new transports.File({ filename: 'logs/http.log', level: 'http' }));
	logger.add(new transports.File({ filename: 'logs/combined.log', level: 'info' }));
	logger.add(
		new transports.File({
			filename: 'logs/error.log',
			level: 'error',
			handleExceptions: true,
			handleRejections: true
		})
	);
}

export default logger;
