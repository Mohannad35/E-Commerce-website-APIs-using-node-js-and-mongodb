const Item = require('../model/item');
const Validator = require('../middleware/Validator');
const itemDebugger = require('debug')('app:item');
const _ = require('lodash');

class ItemController {
	// get all items from database and return them as JSON objects
	static async getAllItems(req, res) {
		itemDebugger(req.headers['user-agent']);
		const pageNum = req.query.pageNumber ? req.query.pageNumber : 1;
		const pageSize = req.query.pageSize ? req.query.pageSize : 10;
		const items = await Item.find({}, 'owner name description category price quantity', {
			populate: { path: 'owner', select: 'name' },
			skip: (pageNum - 1) * pageSize,
			limit: pageSize,
			sort: 'name'
		});
		const count = await Item.countDocuments({}, { skip: pageNum * pageSize, limit: 100 });
		res.send({ pageLength: items.length, remLength: count > 99 ? '+100' : count, items });
	}

	// get item by id from database and return it as JSON object
	static async getOneItem(req, res) {
		itemDebugger(req.headers['user-agent']);
		const item = await Item.findById(req.params.id)
			.populate('owner', 'name')
			.select('owner name description category price quantity');
		if (!item) return res.status(404).send({ message: 'Item not found' });
		res.status(200).send({ item });
	}

	// add new item to Database
	static async addItem(req, res) {
		itemDebugger(req.headers['user-agent']);
		const err = Validator.validateNewItem(req.body);
		if (err) return res.status(400).send({ error: true, message: err });
		const dot = req.body.price.toString().indexOf('.');
		if (dot !== -1) req.body.price = parseFloat(req.body.price.toString().slice(0, dot + 3));
		let newItem = new Item({ ...req.body, owner: req.user._id });
		await newItem.save();
		let item = _.pick(newItem, ['_id', 'name', 'description', 'category', 'price', 'quantity']);
		item = _.set(item, 'owner', req.user.name);
		res.status(201).send({ itemid: item._id, create: true, item });
	}

	static async updateItem(req, res) {
		itemDebugger(req.headers['user-agent']);
		const err = Validator.validateUpdateItem(req.body);
		if (err) return res.status(400).send({ error: true, message: err });
		const updates = Object.keys(req.body);
		const item = await Item.findById(req.params.id);
		if (!item) return res.status(404).send({ message: 'Item not found' });
		if (!item.owner.equals(req.user._id)) return res.status(403).send({ message: 'Access denied' });
		updates.forEach(update => (item[update] = req.body[update]));
		await item.save();
		res.status(200).send({ itemid: item._id, update: true });
	}

	static async deleteItem(req, res) {
		itemDebugger(req.headers['user-agent']);
		const item = await Item.findById(req.params.id);
		if (!item) return res.status(404).send({ message: 'Item not found' });
		if (!item.owner.equals(req.user._id)) return res.status(403).send({ message: 'Access denied' });
		await Item.deleteOne({ _id: item._id });
		res.send({ itemid: item._id, delete: true });
	}
}

module.exports = ItemController;
