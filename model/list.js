import Item from './item.js';
import mongoose from 'mongoose';
import slug from 'mongoose-slug-updater';
mongoose.plugin(slug);

const listSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			minLength: 3,
			maxLength: 255
		},
		userid: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		items: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Item',
				required: true
			}
		],
		slug: { type: String, slug: ['name', 'userid'] }
	},
	{
		timestamps: true
	}
);
listSchema.index({ slug: 1 }, { unique: true });

listSchema.statics.getLists = async function (uid, pageNumber = 1, pageSize = 20, sort = 'userid') {
	const lists = await List.find(
		{ userid: uid },
		{},
		{
			skip: (pageNumber - 1) * pageSize,
			limit: pageSize,
			sort
		}
	).collation({ locale: 'en' });
	return lists;
};

listSchema.statics.remainingLists = async function (
	uid,
	pageNumber = 1,
	pageSize = 20,
	limit = 100
) {
	const count = await List.countDocuments({ userid: uid }, { skip: pageNumber * pageSize, limit });
	return count <= 100 ? count : '+100';
};

listSchema.statics.getList = async function (id, userid, name, populate, page, pageSize) {
	let items, list, total, numberOfPages, remaining, skip, limit;
	if (page && pageSize) {
		skip = (parseInt(page) - 1) * parseInt(pageSize);
		limit = parseInt(pageSize);
	}
	if (id) list = await List.findById(id);
	else if (populate === 'true') list = await List.findOne({ userid, name }).populate('items');
	else list = await List.findOne({ userid, name });

	items = list && list.items;
	if (items) {
		total = items.length;
		if (page && pageSize) {
			items = items.slice(skip, skip + limit);
			numberOfPages = Math.ceil(total / pageSize);
			remaining = total - skip - limit > 0 ? total - skip - limit : 0;
			return {
				total: total || 0,
				remaining,
				paginationResult: {
					numberOfPages,
					currentPage: parseInt(page),
					limit: parseInt(pageSize)
				},
				items: items || []
			};
		}
		return { total: total || 0, remaining: 0, items: items || [] };
	}
	return { total: 0, remaining: 0, items: [] };
};

listSchema.statics.createList = async function (name, userid) {
	const list = new List({ name, userid });
	return list;
};

listSchema.statics.editList = async function (id, name, userid) {
	let list = await List.findById(id);
	if (!list) return { err: true, status: 404, message: 'List not found' };
	if (list.userid !== userid) return { err: true, status: 403, message: 'Access denied.' };
	list.name = name;
	return { list };
};

listSchema.statics.addToList = async function (id, userid, itemid) {
	let list = await List.findById(id);
	if (!list) list = await List.findOne({ name: 'wishlist', userid });
	if (!list) list = await List.create({ name: 'wishlist', userid });
	if (list.userid.toString() !== userid)
		return { err: true, status: 403, message: 'Access denied.' };
	const item = await Item.findById(itemid, 'name');
	if (list.items.includes(itemid))
		return { err: true, status: 400, message: 'Item already added.' };
	list.items = list.items.concat(item._id);
	return { list };
};

listSchema.statics.removeFromList = async function (id, userid, itemid) {
	let list = await List.findById(id);
	if (!list) list = await List.findOne({ name: 'wishlist', userid });
	if (!list) return { err: true, status: 404, message: 'List not found' };
	if (list.userid.toString() !== userid)
		return { err: true, status: 403, message: 'Access denied.' };
	const item = await Item.findById(itemid, 'name');
	if (list.items.includes(item._id))
		list.items = list.items.filter(listItem => !listItem.equals(item._id));
	else return { err: true, status: 404, message: 'Item not in list' };
	return { list };
};

listSchema.statics.deleteList = async function (id, userid) {
	const list = await List.findById(id);
	if (!list) return { err: true, status: 404, message: 'List not found' };
	if (list.userid !== userid) return { err: true, status: 403, message: 'Access denied.' };
	await List.deleteOne({ _id: list._id });
	return { list };
};

const List = mongoose.model('List', listSchema, 'list');
export default List;
