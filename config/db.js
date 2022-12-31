const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
mongoose.Promise = global.Promise; // ES6 - promise
// const dotenv = require('dotenv');
// dotenv.config();

mongoose.connect(process.env.MONGODB_URL, {
	useNewUrlParser: true
});
mongoose.connection
	.once('open', () => {
		console.log('Connected to e-commerceDB');
	})
	.on('error', error => {
		console.log("Error => ", error);
	});
