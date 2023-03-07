const Item = require('../model/item');
const User = require('../model/user');
const Category = require('../model/category');

function generateItemName(num) {
	return `Product ${num < 10 ? `0${num}` : num}`;
}
function generateItemDesc(num) {
	return `Description ${num < 10 ? `0${num}` : num}`;
}

module.exports = async function () {
	console.log(`seeding items...`);
	const categories = await Category.find({}, 'title slug', { limit: 1000 });
	const users = await User.find({ accountType: 'vendor' }, 'name');
	// console.log(users);
	console.log(await Item.deleteMany({}));
	let index = 1;
	for (let category of categories) {
		const user = users[index % users.length];
		await Item.create({
			img: `https://picsum.photos/200/300?random=${index}`,
			name: generateItemName(index),
			description: generateItemDesc(index),
			quantity: 20,
			price: 100,
			category: { _id: category._id, title: category.title, slug: category.slug },
			owner: { _id: user._id, name: user.name }
		});
		index += 1;
	}
};
