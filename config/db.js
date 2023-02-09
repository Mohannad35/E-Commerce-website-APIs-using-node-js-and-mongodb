const mongoose = require('mongoose');
const dbDebugger = require('debug')('app:db');
mongoose.set('strictQuery', true);
mongoose.Promise = global.Promise; // ES6 - promise

mongoose
	.connect(process.env.MONGODB_URL, {
		useNewUrlParser: true,
	})
	.then(() => dbDebugger('Connected to db'))
	.catch(err => dbDebugger(`Couldn't connect to db: ${err.message}`));
