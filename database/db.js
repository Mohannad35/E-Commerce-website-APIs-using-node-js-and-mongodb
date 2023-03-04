const mongoose = require('mongoose');
const config = require('config');
const dbDebugger = require('debug')('app:db');
mongoose.set('strictQuery', true);

async function init() {
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
}

async function close(db) {
	await db.connection.close();
}

module.exports = { init, close };
