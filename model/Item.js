import { unlink } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';
import logger from '../middleware/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const itemSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			minLength: 3,
			maxLength: 255,
			match: /^[\p{L}].*$/u
		},
		img: [{ type: String, trim: true }],
		description: { type: String, required: true },
		quantity: { type: Number, required: true, min: [0, 'Invalid quantity'] },
		price: { type: Number, required: true, min: [0, 'Invalid price'] },
		sold: { type: Number, default: 0, min: [0, 'Invalid sold count'] },
		rating: { type: Number, default: 0, min: [0, 'Invalid rating'], max: [5, 'Invalid rating'] },
		ratingCount: { type: Number, default: 0, min: [0, 'Invalid rating count'] },
		category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
		owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' }
	},
	{
		timestamps: true
	}
);

itemSchema.statics.getItems = async function (query) {
	let { skip, sort, limit, pageNumber, pageSize, name, from, to, sold, category, owner, brand } =
		query;
	if (pageNumber || pageSize) {
		limit = undefined;
		skip = undefined;
	}
	if (pageNumber && !pageSize) pageSize = 20;
	if (!pageNumber && pageSize) pageNumber = 1;
	skip = (pageNumber - 1) * pageSize || skip || 0;
	limit = pageSize || limit || 1000;
	sort = sort || 'name';
	sort = sort.split(',').join(' ');
	let items = [],
		total = 0;
	if (sold) {
		sort = '-sold';
		items = await Item.find({}, {}, { skip, limit, sort }).collation({ locale: 'en' });
		total = await Item.countDocuments({});
	} else if (name) {
		name = new RegExp(name.replace('-', ' '), 'i');
		items = await Item.find({ name }, {}, { skip, limit, sort }).collation({ locale: 'en' });
		total = await Item.countDocuments({ name });
	} else if (from || to) {
		if (to) {
			items = await Item.find(
				{ price: { $gte: from || 0, $lte: to } },
				{},
				{ skip, limit, sort }
			).collation({ locale: 'en' });
			total = await Item.countDocuments({ price: { $gte: from || 0, $lte: to } });
		} else {
			items = await Item.find({ price: { $gte: from || 0 } }, {}, { skip, limit, sort }).collation({
				locale: 'en'
			});
			total = await Item.countDocuments({ price: { $gte: from || 0 } });
		}
	} else if (brand) {
		brand = brand.split(',');
		if (brand.length > 1) {
			for (let b of brand) {
				const its = await Item.find({ brand: b }, {}, { skip, limit, sort }).collation({
					locale: 'en'
				});
				items = [...items, ...its];
				total += await Item.countDocuments({ brand: b });
			}
		} else {
			items = await Item.find({ brand }, {}, { skip, limit, sort }).collation({ locale: 'en' });
			total = await Item.countDocuments({ brand });
		}
	} else if (category) {
		items = await Item.find({ category }, {}, { skip, limit, sort }).collation({ locale: 'en' });
		total = await Item.countDocuments({ category });
	} else if (owner) {
		items = await Item.find({ owner }, {}, { skip, limit, sort }).collation({ locale: 'en' });
		total = await Item.countDocuments({ owner });
	} else {
		items = await Item.find({}, {}, { skip, limit, sort }).collation({ locale: 'en' });
		total = await Item.countDocuments({});
	}
	const numberOfPages = Math.ceil(total / pageSize);
	const remaining = total - skip - limit > 0 ? total - skip - limit : 0;
	if (pageNumber)
		return {
			total,
			remaining,
			paginationResult: {
				currentPage: parseInt(pageNumber),
				numberOfPages,
				limit: parseInt(pageSize)
			},
			items
		};
	else return { total, remaining, items };
};

itemSchema.statics.getItemById = async function (id, populate) {
	if (populate)
		return await Item.findById(id)
			.populate('owner', 'name email')
			.populate('category')
			.populate('brand');
	return await Item.findById(id);
};

itemSchema.statics.createItem = async function (owner, body, images) {
	const { category, brand, name, description, quantity } = body;
	let { price } = body;
	const dot = price.toString().indexOf('.');
	if (dot !== -1) price = parseFloat(price.toString().slice(0, dot + 3));
	let item = new Item({ brand, owner, category, name, description, quantity, price });
	images.forEach(image => item.img.push(`http://localhost:5000/images/${image.filename}`));
	return item;
};

itemSchema.statics.editItem = async function (id, owner, updates, body, images, deleteImages) {
	const item = await Item.findById(id);
	if (!item) return { err: true, status: 404, message: 'Item not found' };
	if (!item.owner._id.equals(owner)) return { err: true, status: 403, message: 'Access denied' };
	if ('price' in body) {
		const dot = body.price.toString().indexOf('.');
		if (dot !== -1) body.price = parseFloat(body.price.toString().slice(0, dot + 3));
	}
	updates.forEach(update => (item[update] = body[update]));
	images &&
		images.forEach(image => item.img.push(`http://localhost:5000/images/${image.filename}`));
	if (typeof deleteImages === 'object') {
		deleteImages.forEach(image => (item.img = item.img.filter(value => value !== image)));
		deleteImages.forEach(async image => {
			await unlink(
				`${__dirname.replace(/model/, '')}public/images/${image.replace(/.*images\//, '')}`,
				err => err && logger.error(err.message, err)
			);
		});
	} else if (typeof deleteImages === 'string') {
		item.img = item.img.filter(img => img !== deleteImages);
		await unlink(
			`${__dirname.replace(/model/, '')}public/images/${deleteImages.replace(/.*images\//, '')}`,
			err => err && logger.error(err.message, err)
		);
	}
	return { item };
};

itemSchema.statics.deleteItem = async function (id, owner) {
	const item = await Item.findById(id);
	if (!item) return { err: true, status: 404, message: 'Item not found' };
	if (!item.owner._id.equals(owner)) return { err: true, status: 403, message: 'Access denied' };
	item.img.forEach(async image => {
		await unlink(
			`${__dirname.replace(/model/, '')}public/images/${image.replace(/.*images\//, '')}`,
			err => err && logger.error(err.message, err)
		);
	});
	await Item.deleteOne({ _id: item._id });
	return { item };
};

const Item = mongoose.model('Item', itemSchema, 'item');
export default Item;
