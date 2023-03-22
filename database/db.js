const mongoose = require('mongoose');
const config = require('config');
const debug = require('debug');

mongoose.set('strictQuery', true);
const dbDebugger = debug('app:db');

module.exports.init = async function init() {
	let db = await mongoose
		.connect(config.get('mongodb_url'), {
			useUnifiedTopology: true,
			useNewUrlParser: true,
			autoIndex: true
		})
		.then(db => {
			dbDebugger('connected to db');
			return db;
		});
	mongoose.connection.on('error', err => dbDebugger(`Connection err: ${err.message}`));
	mongoose.connection.on('connected', () => dbDebugger('connected to db'));
	mongoose.connection.on('disconnected', () => dbDebugger('disconnected from db...'));
	return db;
};

module.exports.close = async function close(db) {
	await db.connection.close();
};
