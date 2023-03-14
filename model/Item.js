const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
	{
		img: {
			type: String
		},
		name: {
			type: String,
			required: true,
			trim: true,
			minLength: 3,
			maxLength: 255,
			match: /^[\p{L}].*$/u
		},
		description: {
			type: String,
			required: true
		},
		price: {
			type: Number,
			required: true,
			min: [0, 'Invalid price']
		},
		quantity: {
			type: Number,
			required: true,
			min: [0, 'Invalid quantity']
		},
		category: {
			_id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Category',
				required: true
			},
			title: {
				type: String,
				trim: true,
				minLength: 3,
				maxLength: 255
			},
			slug: {
				type: String
			}
		},
		owner: {
			_id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
				required: true
			},
			name: {
				type: String,
				trim: true,
				minLength: 3,
				maxLength: 255
			}
		}
	},
	{
		timestamps: true
	}
);

itemSchema.statics.getItems = async function (query) {
	let { skip, sort, limit } = query;
	let { name, price, categoryId, categoryTitle, categorySlug, ownerId, ownerName } = query;
	skip = skip || 0;
	sort = sort || 'name';
	limit = limit || 1000;
	if (name) {
		name = new RegExp(name.replace('-', ' '), 'i');
		return await Item.find({ name }, {}, { skip, limit, sort });
	}
	if (categoryId) {
		return await Item.find({ 'category._id': categoryId }, {}, { skip, limit, sort });
	}
	if (categorySlug) {
		categorySlug = new RegExp(categorySlug, 'i');
		return await Item.find({ 'category.slug': categorySlug }, {}, { skip, limit, sort });
	}
	if (categoryTitle) {
		categoryTitle = new RegExp(categoryTitle.replace('-', ' '), 'i');
		return await Item.find({ 'category.title': categoryTitle }, {}, { skip, limit, sort });
	}
	if (ownerId) return await Item.find({ 'owner._id': ownerId }, {}, { skip, limit, sort });
	if (ownerName) {
		ownerName = new RegExp(ownerName.replace('-', ' '), 'i');
		return await Item.find({ 'owner.name': ownerName }, {}, { skip, limit, sort });
	}
	if (price) {
		const [min, max] = price.split('-'); // 300-1000
		return await Item.find({ price: { $gte: min, $lte: max } }, {}, { skip, limit, sort });
	}
	return await Item.find({}, {}, { skip, limit, sort });
};

itemSchema.statics.remainingItems = async function (pageNumber = 1, pageSize = 20, limit = 100) {
	const count = await Item.countDocuments({}, { skip: pageNumber * pageSize, limit });
	return count <= 100 ? count : '+100';
};

itemSchema.statics.getItemById = async function (id) {
	return await Item.findById(id, 'owner name description category price quantity');
};

itemSchema.statics.createItem = async function (owner, category, body) {
	const { name, description, quantity } = body;
	let { price } = body;
	const dot = price.toString().indexOf('.');
	if (dot !== -1) price = parseFloat(price.toString().slice(0, dot + 3));
	let item = new Item({ owner, category, name, description, category, price, quantity });
	return item;
};

itemSchema.statics.editItem = async function (id, owner, updates, body) {
	const item = await Item.findById(id);
	if (!item) return { err: true, status: 404, message: 'Item not found' };
	if (!item.owner._id.equals(owner)) return { err: true, status: 403, message: 'Access denied' };
	if ('price' in body) {
		const dot = body.price.toString().indexOf('.');
		if (dot !== -1) body.price = parseFloat(body.price.toString().slice(0, dot + 3));
	}
	updates.forEach(update => (item[update] = body[update]));
	return { item };
};

itemSchema.statics.deleteItem = async function (id, owner) {
	const item = await Item.findById(id);
	if (!item) return { err: true, status: 404, message: 'Item not found' };
	if (!item.owner._id.equals(owner)) return { err: true, status: 403, message: 'Access denied' };
	await Item.deleteOne({ _id: item._id });
	return { item };
};

const Item = mongoose.model('Item', itemSchema, 'item');
module.exports = Item;
