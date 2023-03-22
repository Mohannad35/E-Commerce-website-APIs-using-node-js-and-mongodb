const mongoose = require('mongoose');
const Item = require('./item.js');

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
				_id: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Item',
					required: true
				},
				name: {
					type: String,
					required: true,
					trim: true,
					minLength: 3,
					maxLength: 255,
					match: /^[\p{L}].*$/u
				}
			}
		],
		slug: { type: String, slug: ['name', 'userid'] }
	},
	{
		timestamps: true
	}
);

listSchema.statics.getLists = async function (uid, pageNumber = 1, pageSize = 20, sort = 'userid') {
	const lists = await List.find({ userid: uid }, 'name userid items slug', {
		skip: (pageNumber - 1) * pageSize,
		limit: pageSize,
		sort
	}).collation({ locale: 'en' });
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

listSchema.statics.getList = async function (id) {
	return await List.findById(id, 'name userid items slug');
};

listSchema.statics.createList = async function (name, userid) {
	const list = new List({ name, userid });
	return list;
};

listSchema.statics.editList = async function (id, name, userid) {
	let list = await List.findById(id, 'name userid slug');
	if (!list) return { err: true, status: 404, message: 'List not found' };
	if (list.userid !== userid) return { err: true, status: 403, message: 'Access denied.' };
	list.name = name;
	return { list };
};

listSchema.statics.addToList = async function (id, userid, itemid) {
	let list = await List.findById(id, 'name userid items slug');
	if (!list) return { err: true, status: 404, message: 'List not found' };
	if (list.userid.toString() !== userid)
		return { err: true, status: 403, message: 'Access denied.' };
	const item = await Item.findById(itemid, 'name');
	const items = [];
	list.items.forEach(item => items.push(item._id.toString()));
	if (items.includes(itemid)) return { err: true, status: 400, message: 'Item already added.' };
	list.items = list.items.concat({ _id: item._id, name: item.name });
	return { list };
};

listSchema.statics.removeFromList = async function (id, userid, itemid) {
	let list = await List.findById(id, 'name userid items slug');
	if (!list) return { err: true, status: 404, message: 'List not found' };
	if (list.userid.toString() !== userid)
		return { err: true, status: 403, message: 'Access denied.' };
	const item = await Item.findById(itemid, 'name');
	list.items = list.items.filter(listItem => !listItem._id.equals(item._id));
	return { list };
};

listSchema.statics.deleteList = async function (id, userid) {
	const list = await List.findById(id, 'name userid slug');
	if (!list) return { err: true, status: 404, message: 'List not found' };
	if (list.userid !== userid) return { err: true, status: 403, message: 'Access denied.' };
	await List.deleteOne({ _id: list._id });
	return { list };
};

const List = mongoose.model('List', listSchema, 'list');
module.exports = List;
