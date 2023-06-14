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

	limit = pageNumber || pageSize ? undefined : limit;
	skip = pageNumber || pageSize ? undefined : skip;
	pageSize = pageNumber && !pageSize ? 20 : pageSize;
	pageNumber = !pageNumber && pageSize ? 1 : pageNumber;
	skip = (pageNumber - 1) * pageSize || skip || 0;
	limit = pageSize || limit || 1000;
	sort = sold ? '-sold' : sort || 'name';
	sort = sort.split(',').join(' ');
	let items = [],
		total = 0;
	name = name ? new RegExp(name.replace('-', ' '), 'i') : /.*/;
	brand = brand ? brand.split(',') : undefined;
	owner = owner ? owner.split(',') : undefined;
	category = category ? category.split(',') : undefined;
	if (sold) {
		sort = '-sold';
		items = await Item.find({}, {}, { skip, limit, sort }).collation({ locale: 'en' });
		total = await Item.countDocuments({});
	} else {
		items = await Item.find(
			{
				name,
				price: { $gte: from || 0, $lte: to || 10000000 },
				owner: owner ? { $in: owner } : { $nin: [] },
				brand: brand ? { $in: brand } : { $nin: [] },
				category: category ? { $in: category } : { $nin: [] }
			},
			{},
			{ skip, limit, sort }
		).collation({ locale: 'en' });
		total = await Item.countDocuments({
			name,
			price: { $gte: from || 0, $lte: to || 10000000 },
			owner: owner ? { $in: owner } : { $nin: [] },
			brand: brand ? { $in: brand } : { $nin: [] },
			category: category ? { $in: category } : { $nin: [] }
		});
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
