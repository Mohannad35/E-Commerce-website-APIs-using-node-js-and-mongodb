const Item = require('../model/item');
const Category = require('../model/category');
const itemDebugger = require('debug')('app:item');
const _ = require('lodash');

class ItemController {
	// get all items from database and return them as JSON objects
	static async items(req, res) {
		itemDebugger(req.headers['user-agent']);
		const { query } = req;
		const items = await Item.getItems(query);
		res.send({ length: items.length, items });
	}

	// get item by id from database and return it as JSON object
	static async getOneItem(req, res) {
		itemDebugger(req.headers['user-agent']);
		const item = await Item.getItemById(req.params.id);
		if (!item) return res.status(404).send({ message: 'Item not found' });
		res.status(200).send({ item });
	}

	// add new item to Database
	static async addItem(req, res) {
		itemDebugger(req.headers['user-agent']);
		const { _id, name } = req.user;
		const { categoryId, ...body } = req.body;
		const category = await Category.findById(categoryId, 'title');
		if (!category) return res.status(404).send({ error: true, message: 'Category not found' });
		let item = await Item.createItem({ _id, name }, category, body);
		await item.save();
		item = _(item)
			.pick(['_id', 'name', 'description', 'price', 'quantity'])
			.set('owner', name)
			.set('category', category.title)
			.value();
		res.status(201).send({ itemid: item._id, create: true, item });
	}

	static async updateItem(req, res) {
		itemDebugger(req.headers['user-agent']);
		let { body } = req;
		const { _id: owner } = req.user;
		const { id } = req.params;
		let updates = Object.keys(body);
		if (updates.includes('categoryId')) {
			const category = await Category.findById(body.categoryId, 'title');
			if (!category) return res.status(404).send({ error: true, message: 'Category not found' });
			_.unset(body, 'categoryId');
			_.set(body, 'category', category);
			updates = Object.keys(body);
		}
		const { err, status, message, item } = await Item.editItem(id, owner, updates, body);
		if (err) return res.status(status).send({ error: true, message });
		await item.save();
		res.status(200).send({ itemid: item._id, update: true });
	}

	static async deleteItem(req, res) {
		itemDebugger(req.headers['user-agent']);
		const { _id: owner } = req.user;
		const { id } = req.params;
		const { err, status, message, item } = await Item.deleteItem(id, owner);
		if (err) return res.status(status).send({ error: true, message });
		res.send({ itemid: item._id, delete: true });
	}
}

module.exports = ItemController;
