import moment from 'moment';
import { User } from './../model/user.js';

let admin = {
	name: `Ahmed`,
	email: `ahmed@gmail.com`,
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

function generateUser(num, type = 'client') {
	if (type === 'client')
		return {
			name: `User ${num < 10 ? `0${num}` : num}`,
			email: `user${num < 10 ? `0${num}` : num}@gmail.com`,
			password: '123456aB',
			birthday: moment().subtract(myRandomInt(12, 50), 'years').format('YYYY-MM-DD'),
			gender: num % 2 ? 'female' : 'male',
			accountType: type,
			isVerified: true,
			phoneNumber: `01${myRandomInt(0, 3)}${randomId(8)}`,
			address: `address ${num < 10 ? `0${num}` : num}`
		};
	if (type === 'vendor') {
		return {
			name: `User ${num < 10 ? `0${num}` : num}`,
			email: `user${num < 10 ? `0${num}` : num}@gmail.com`,
			password: '123456aB',
			birthday: moment().subtract(myRandomInt(12, 50), 'years').format('YYYY-MM-DD'),
			gender: num % 2 ? 'female' : 'male',
			accountType: type,
			isVerified: true,
			phoneNumber: `01${myRandomInt(3)}${randomId(8)}`,
			address: `address ${num < 10 ? `0${num}` : num}`,
			companyName: `company ${num < 10 ? `0${num}` : num}`,
			businessAddress: `business address ${num < 10 ? `0${num}` : num}`,
			websiteAddress: `example${num < 10 ? `0${num}` : num}.com`
		};
	}
}

export default async function () {
	console.log(`seeding users...`);
	console.log(await User.deleteMany({}));
	let user = new User(admin);
	await user.save();
	for (let i = 1; i <= 10; i++) {
		user = new User(generateUser(i, i % 4 ? 'client' : 'vendor'));
		await user.save();
	}
}
