const Item = require('../model/item');
const User = require('../model/user');

class ItemController {
	// get all items from database and return them as JSON objects
	static async getAllItems(req, res) {
		try {
			const items = await Item.find(
				{},
				{ owner: 1, name: 1, description: 1, category: 1, price: 1, quantity: 1 }
			);
			res.status(200).send(items);
		} catch (error) {
			res.status(400).send(error.message);
		}
	}

	// get item by id from database and return it as JSON object
	static async getOneItem(req, res) {
		try {
			// next line need to be checked for a better error message
			const item = await Item.findOne({ _id: req.params.id }).catch(error => console.log());
			if (!item) return res.status(404).send('Item not found');
			const user = await User.findOne({ _id: item.owner });
			res.status(200).send({
				name: item.name,
				description: item.description,
				category: item.category,
				price: item.price,
				quantity: item.quantity,
				owner: user.name,
			});
		} catch (error) {
			res.status(400).send(error.message);
		}
	}

	// add new item to Database
	static async addItem(req, res) {
		try {
			if (req.user.accountType !== 'vendor' && req.user.accountType !== 'admin')
				throw new Error('only vendors and admins can add items');
			const newItem = new Item({
				...req.body,
				owner: req.user._id,
			});
			await newItem.save();
			res.status(201).send({
				id: newItem._id,
				name: newItem.name,
				description: newItem.description,
				category: newItem.category,
				price: newItem.price,
				quantity: newItem.quantity,
				owner: req.user.name,
			});
		} catch (error) {
			res.status(400).send(error.message);
		}
	}

	// update item in Database with recived body object
	// (ex: update an item name or price or both)
	static async updateItem(req, res) {
		const updates = Object.keys(req.body);
		const allowedUpdates = ['name', 'description', 'category', 'price', 'quantity'];
		const isValidOperation = updates.every(update => allowedUpdates.includes(update));
		if (!isValidOperation) return res.status(400).send({ error: 'invalid updates' });
		try {
			const item = await Item.findOne({ _id: req.params.id });
			if (!item) return res.status(404).send('item not found');
			if (req.user.accountType !== 'admin' && req.user._id !== item.owner)
				throw new Error('you are not allowed to edit this item');
			updates.forEach(update => (item[update] = req.body[update]));
			await item.save();
			res.send(item);
		} catch (error) {
			res.status(400).send(error.message);
		}
	}

	// delete item from Database with recived _id and return the deleted item
	static async deleteItem(req, res) {
		try {
			const deletedItem = await Item.findOne({ _id: req.params.id });
			if (!deletedItem) return res.status(404).send({ error: 'Item not found' });
			if (req.user.accountType !== 'admin' && req.user._id !== deletedItem.owner)
				throw new Error('you are not allowed to delete this item');
			await Item.deleteOne({ _id: req.params.id });
			res.send(deletedItem);
		} catch (error) {
			res.status(400).send(error.message);
		}
	}
}

module.exports = ItemController;
