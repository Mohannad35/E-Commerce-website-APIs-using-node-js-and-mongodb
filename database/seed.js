import mongoose from 'mongoose';
import slug from 'mongoose-slug-updater';
import seed_category from './seed_category.js';
import seed_item from './seed_item.js';
import seed_user from './seed_user.js';
import { init, close } from './db.js';
mongoose.plugin(slug);

async function run() {
	const db = await init();

	// await seed_user();
	await seed_category();
	// await seed_item();

	await close(db);
}
run();
