import mongoose from 'mongoose';
import slug from 'mongoose-slug-updater';
import seed_category from './seed_category.js';
import seed_item from './seed_item.js';
import seed_user from './seed_user.js';
import { init, close } from './db.js';
import Item from '../model/item.js';
import Brand from '../model/brand.js';
import Category from '../model/category.js';
mongoose.plugin(slug);

async function run() {
	const db = await init();

	// await seed_user();
	// await seed_category();
	// await seed_item();

	// Replace from and to local host
	// await replaceHost('https://ecommerceweb12.azurewebsites.net', 'http://localhost:5000');

	await close(db);
}
run();

async function replaceHost(from, to) {
	const items = await Item.find({ img: { $exists: true } })
		.select('img')
		.limit(1000);
	for (let item of items) {
		item.img = item.img.map(image => image.replace(from, to));
		await item.save();
	}
	const brands = await Brand.find({ img: { $exists: true } })
		.select('img')
		.limit(1000);
	for (let brand of brands) {
		brand.img = brand.img.replace(from, to);
		await brand.save();
	}
	const cats = await Category.find({ img: { $exists: true } })
		.select('img')
		.limit(1000);
	for (let cat of cats) {
		cat.img = cat.img.replace(from, to);
		await cat.save();
	}
}
