const mongoose = require('mongoose');
const config = require('config');
const dbDebugger = require('debug')('app:db');
mongoose.set('strictQuery', true);
// mongoose.Promise = global.Promise; // ES6 - promise

module.exports = function () {
	mongoose
		.connect(config.get('mongodb_url'), { useNewUrlParser: true })
		.then(() => dbDebugger('Connected to db'))
		.catch(err => dbDebugger(`Couldn't connect to db: ${err.message}`));
};

// // replicaSet configuration (for  using transactions in future versions)
// rsconf = {
// 	_id: 'rs0',
// 	members: [
// 		{
// 			_id: 0,
// 			host: 'localhost:27018'
// 		}
// 	]
// };
// replication:
//   oplogSizeMB: 2000
//   replSetName: 'rs0'
