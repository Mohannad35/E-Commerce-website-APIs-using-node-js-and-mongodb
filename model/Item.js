import mongoose from 'mongoose';

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
	let { skip, sort, limit, pageNumber, pageSize } = query;
	let { name, price, categoryId, categoryTitle, categorySlug, ownerId, ownerName } = query;
	if (pageNumber || pageSize) {
		limit = undefined;
		skip = undefined;
	}
	if (pageNumber && !pageSize) pageSize = 20;
	if (!pageNumber && pageSize) pageNumber = 1;
	skip = (pageNumber - 1) * pageSize || skip || 0;
	limit = pageSize || limit || 1000;
	sort = sort || 'name';
	if (sort) sort = sort.split(',').join(' ');
	let items;
	if (name) {
		name = new RegExp(name.replace('-', ' '), 'i');
		items = await Item.find({ name }, {}, { skip, limit, sort });
	} else if (categoryId) {
		items = await Item.find({ 'category._id': categoryId }, {}, { skip, limit, sort });
	} else if (categorySlug) {
		categorySlug = new RegExp(categorySlug, 'i');
		items = await Item.find({ 'category.slug': categorySlug }, {}, { skip, limit, sort });
	} else if (categoryTitle) {
		categoryTitle = new RegExp(categoryTitle.replace('-', ' '), 'i');
		items = await Item.find({ 'category.title': categoryTitle }, {}, { skip, limit, sort });
	} else if (ownerId) items = await Item.find({ 'owner._id': ownerId }, {}, { skip, limit, sort });
	else if (ownerName) {
		ownerName = new RegExp(ownerName.replace('-', ' '), 'i');
		items = await Item.find({ 'owner.name': ownerName }, {}, { skip, limit, sort });
	} else if (price) {
		const [min, max] = price.split('-'); // 300-1000
		items = await Item.find({ price: { $gte: min, $lte: max } }, {}, { skip, limit, sort });
	} else items = await Item.find({}, {}, { skip, limit, sort });
	return { pageNumber, pageSize, items };
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
export default Item;
