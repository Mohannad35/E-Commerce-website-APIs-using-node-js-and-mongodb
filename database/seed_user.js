const User = require('../model/user');
const moment = require('moment');

let admin = {
	name: `Ahmed`,
	email: `ahmed@gmail.com`,
	password: '123456aB',
	birthday: moment().subtract(myRandomInt(12, 80), 'years').format('YYYY-MM-DD'),
	gender: 'male',
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

function generateUser(num, type = 'client') {
	if (type === 'client')
		return {
			name: `User ${num < 10 ? `0${num}` : num}`,
			email: `user${num < 10 ? `0${num}` : num}@gmail.com`,
			password: '123456aB',
			birthday: moment().subtract(myRandomInt(12, 80), 'years').format('YYYY-MM-DD'),
			gender: num % 2 ? 'female' : 'male',
			accountType: type,
			phoneNumber: `01${myRandomInt(0, 3)}${randomId(8)}`,
			address: `address ${num < 10 ? `0${num}` : num}`
		};
	if (type === 'vendor') {
		return {
			name: `User ${num < 10 ? `0${num}` : num}`,
			email: `user${num < 10 ? `0${num}` : num}@gmail.com`,
			password: '123456aB',
			birthday: moment().subtract(myRandomInt(12, 80), 'years').format('YYYY-MM-DD'),
			gender: num % 2 ? 'female' : 'male',
			accountType: type,
			phoneNumber: `01${myRandomInt(3)}${randomId(8)}`,
			address: `address ${num < 10 ? `0${num}` : num}`,
			companyName: `company ${num < 10 ? `0${num}` : num}`,
			businessAddress: `business address ${num < 10 ? `0${num}` : num}`,
			websiteAddress: `example${num < 10 ? `0${num}` : num}.com`
		};
	}
}

module.exports = async function () {
	console.log(`seeding users...`);
	console.log(await User.deleteMany({}));
	console.log(moment().subtract(myRandomInt(12, 80), 'years').format('YYYY-MM-DD'));
	let user = new User(admin);
	await user.save();
	for (let i = 1; i <= 20; i++) {
		user = new User(generateUser(i, i % 4 ? 'client' : 'vendor'));
		await user.save();
	}
};
