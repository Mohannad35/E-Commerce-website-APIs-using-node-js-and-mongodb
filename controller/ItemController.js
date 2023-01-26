const Item = require("../model/Item");

class ItemController {
	// get all items from database and return them as JSON objects
	static async getAllItems(req, res) {
		try {
			const items = await Item.find({});
			res.status(200).send(items);
		} catch (error) {
			res.status(400).send(error.message);
		}
	}

	// get item by id from database and return it as JSON object
	static async getOneItem(req, res) {
		try {
			const item = await Item.findOne({ _id: req.params.id });
			if (!item) {
				res.status(404).send({ error: "Item not found" });
			}
			res.status(200).send(item);
		} catch (error) {
			res.status(400).send(error.message);
		}
	}

	// add new item to Database
	static async addItem(req, res) {
		try {
			const newItem = new Item({
				...req.body,
				owner: req.user._id,
			});
			await newItem.save();
			res.status(201).send(newItem);
		} catch (error) {
			// console.log({ error });
			res.status(400).send(error.message);
		}
	}

	// update item in Database with recived body object
	// (ex: update an item name or price or both)
	static async updateItem(req, res) {
		const updates = Object.keys(req.body);
		const allowedUpdates = ["name", "description", "category", "price"];
		const isValidOperation = updates.every(update => allowedUpdates.includes(update));
		if (!isValidOperation) {
			return res.status(400).send({ error: "invalid updates" });
		}
		try {
			const item = await Item.findOne({ _id: req.params.id });
			if (!item) {
				return res.status(404).send("item not found");
			}
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
			const deletedItem = await Item.findOneAndDelete({ _id: req.params.id });
			if (!deletedItem) {
				res.status(404).send({ error: "Item not found" });
			}
			res.send(deletedItem);
		} catch (error) {
			res.status(400).send(error.message);
		}
	}
}

module.exports = ItemController;
