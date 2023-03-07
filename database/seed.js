const mongoose = require('mongoose');
var slug = require('mongoose-slug-updater');
mongoose.plugin(slug);
const { init, close } = require('./db');
const seed_user = require('./seed_user');
const seed_category = require('./seed_category');
const seed_item = require('./seed_item');

async function run() {
	const db = await init();

	await seed_user();
	await seed_category();
	await seed_item();

	await close(db);
}
run();
