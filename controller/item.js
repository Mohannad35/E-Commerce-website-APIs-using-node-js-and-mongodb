const Item = require('../model/item');
const Validator = require('../middleware/Validator');
const itemDebugger = require('debug')('app:item');

class ItemController {
	// get all items from database and return them as JSON objects
	static async getAllItems(req, res) {
		try {
			itemDebugger(req.headers['user-agent']);
			const pageNumber = req.query.pageNumber ? req.query.pageNumber : 1;
			const pageSize = req.query.pageSize ? req.query.pageSize : 10;
			const items = await Item.find()
				.populate('owner', '-_id name')
				.select('owner name description category price quantity')
				.skip((pageNumber - 1) * pageSize)
				.limit(pageSize)
				.sort('name');
			const itemsCount = await Item.find().count();
			res.status(200).send({ pageLength: items.length, totalLength: itemsCount, items });
		} catch (error) {
			res.status(400).send(error.message);
		}
	}

	// get item by id from database and return it as JSON object
	static async getOneItem(req, res) {
		try {
			itemDebugger(req.headers['user-agent']);
			const { error } = Validator.validateItemId(req.params);
			if (error) throw new Error(error.details[0].message);
			const item = await Item.findById(req.params.id)
				.populate('owner', 'name')
				.select('owner name description category price quantity');
			if (!item) return res.status(404).send('Item not found');
			res.status(200).send(item);
		} catch (error) {
			res.status(400).send(error.message);
		}
	}

	// add new item to Database
	static async addItem(req, res) {
		try {
			itemDebugger(req.headers['user-agent']);
			if (req.user.accountType !== 'vendor' && req.user.accountType !== 'admin')
				throw new Error('only vendors and admins can add items');
			const { error } = Validator.validateNewItem(req.body);
			if (error) throw new Error(error.details[0].message);
			let newItem = new Item({
				...req.body,
				owner: req.user._id,
			});
			await newItem.save();
			newItem = await Item.findById(newItem._id)
				.populate('owner', 'name')
				.select('owner name description category price quantity');
			res.status(201).send({ message: 'item added', item: newItem });
		} catch (error) {
			res.status(400).send(error.message);
		}
	}

	static async updateItem(req, res) {
		try {
			itemDebugger(req.headers['user-agent']);
			// validate req params
			const { error: errorId } = Validator.validateItemId(req.params);
			if (errorId) throw new Error(errorId.details[0].message);
			// validate req body
			const { error } = Validator.validateUpdateItem(req.body);
			if (error) throw new Error(error.details[0].message);
			const updates = Object.keys(req.body);
			const item = await Item.findById(req.params.id);
			if (!item) return res.status(404).send('item not found');
			if (!(req.user.accountType === 'admin' || item.owner.equals(req.user._id)))
				throw new Error('you are not allowed to edit this item');
			updates.forEach(update => (item[update] = req.body[update]));
			await item.save();
			res.send({ message: 'item updated', item: item });
		} catch (error) {
			res.status(400).send(error.message);
		}
	}

	// delete item from Database with recived _id and return the deleted item
	static async deleteItem(req, res) {
		try {
			itemDebugger(req.headers['user-agent']);
			const { error: errorId } = Validator.validateItemId(req.params);
			if (errorId) throw new Error(errorId.details[0].message);
			const item = await Item.findById(req.params.id);
			if (!item) return res.status(404).send('Item not found');
			if (!(req.user.accountType === 'admin' || item.owner.equals(req.user._id)))
				throw new Error('you are not allowed to delete this item');
			const deletedItem = await Item.findByIdAndDelete(req.params.id);
			res.send({ message: 'item deleted', item: deletedItem });
		} catch (error) {
			res.status(400).send(error.message);
		}
	}
}

module.exports = ItemController;
