import _ from 'lodash';
import Category from '../model/category.js';
import Brand from '../model/brand.js';
import Item from './../model/item.js';

export default class ItemController {
	// get all items from database and return them as JSON objects
	static async items(req, res) {
		const { query } = req;
		const { total, remaining, paginationResult, items } = await Item.getItems(query);
		res.send({ length: items.length, total, remaining, paginationResult, items });
	}

	// get item by id from database and return it as JSON object
	static async getOneItem(req, res) {
		const { populate } = req.query;
		const item = await Item.getItemById(req.params.id, populate);
		if (!item) return res.status(404).send({ message: 'Item not found' });
		res.status(200).send({ item });
	}

	// add new item to Database
	static async addItem(req, res) {
		const { _id, name } = req.user;
		const { body } = req;
		let item = await Item.createItem(_id, body, req.files);
		await item.save();
		res.status(201).send({ itemid: item._id, create: true, item });
	}

	static async updateItem(req, res) {
		const { deleteImages, ...body } = req.body;
		const { _id: owner } = req.user;
		const { id } = req.params;
		const updates = Object.keys(body);
		const { err, status, message, item } = await Item.editItem(
			id,
			owner,
			updates,
			body,
			req.files,
			deleteImages
		);
		if (err) return res.status(status).send({ error: true, message });
		await item.save();
		res.status(200).send({ itemid: item._id, update: true, item });
	}

	static async deleteItem(req, res) {
		const { _id: owner } = req.user;
		const { id } = req.params;
		const { err, status, message, item } = await Item.deleteItem(id, owner);
		if (err) return res.status(status).send({ error: true, message });
		res.send({ itemid: item._id, delete: true });
	}
}
