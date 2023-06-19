import moment from 'moment';
import User from './../model/user.js';

let admin = {
	name: `Admin`,
	email: `admin@gmail.com`,
	password: '123456aB',
	birthday: moment().subtract(myRandomInt(12, 80), 'years').format('YYYY-MM-DD'),
	gender: 'male',
	isVerified: true,
	accountType: 'admin',
	phoneNumber: `01${myRandomInt(0, 3)}${randomId(8)}`,
	address: `address`
};

function myRandomInts(quantity, max) {
	const set = new Set();
	while (set.size < quantity) {
		set.add(Math.floor(Math.random() * max) + 1);
	}
	return set;
}

function myRandomInt(min = 0, max = 10) {
	return Math.floor(Math.random() * max) + min;
}

function randomId(length = 8) {
	// prettier-ignore
	return Math.random().toString().substring(2, length + 2);
}

function generateUser(type = 'client') {
	if (type === 'client')
		return {
			name: `Client`,
			email: `client@gmail.com`,
			password: '123456aB',
			birthday: moment().subtract(myRandomInt(12, 50), 'years').format('YYYY-MM-DD'),
			gender: 'male',
			accountType: type,
			isVerified: true,
			phoneNumber: `01${myRandomInt(0, 3)}${randomId(8)}`,
			address: `client address`
		};
	if (type === 'vendor') {
		return {
			name: `Vendor`,
			email: `vendor@gmail.com`,
			password: '123456aB',
			birthday: moment().subtract(myRandomInt(12, 50), 'years').format('YYYY-MM-DD'),
			gender: 'male',
			accountType: type,
			isVerified: true,
			phoneNumber: `01${myRandomInt(3)}${randomId(8)}`,
			address: `vendor address`,
			companyName: `vendor company name`,
			businessAddress: `vendor business address`,
			websiteAddress: `example.com`
		};
	}
}

export default async function () {
	console.log(`seeding users...`);
	console.log(await User.deleteMany({}));
	let user = new User(admin);
	await user.save();
	user = new User(generateUser('client'));
	await user.save();
	user = new User(generateUser('vendor'));
	await user.save();
}
