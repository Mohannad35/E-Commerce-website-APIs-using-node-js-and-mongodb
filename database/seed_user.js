const User = require('../model/user');

let admin = {
	name: 'Ahmed',
	email: 'ahmed@gmail.com',
	password: '123456aB',
	accountType: 'admin',
	phoneNumbers: [{ phoneNumber: '01234567890' }]
};

function generateUser(num, type = 'client') {
	return {
		name: `User ${num < 10 ? `0${num}` : num}`,
		email: `user${num < 10 ? `0${num}` : num}@gmail.com`,
		password: '123456aB',
		accountType: type,
		phoneNumbers: [{ phoneNumber: '01234567890' }]
	};
}

module.exports = async function () {
	console.log(`seeding users...`);
	console.log(await User.deleteMany({}));
	let user = new User(admin);
	await user.save();
	for (let i = 1; i <= 20; i++) {
		user = new User(generateUser(i, i % 4 ? 'client' : 'vendor'));
		await user.save();
	}
};
