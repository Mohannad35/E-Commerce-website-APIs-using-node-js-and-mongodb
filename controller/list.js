import _ from 'lodash';
import List from './../model/list.js';

export default class ListController {
	static async lists(req, res) {
		const { _id } = req.user;
		const { pageNumber, pageSize, sortBy } = req.query;
		const lists = await List.getLists(_id, pageNumber, pageSize, sortBy);
		const remainingLists = await List.remainingLists(_id, pageNumber, pageSize, 100);
		res.send({ pageLength: lists.length, remainingLists, lists });
	}

	static async list(req, res) {
		const { _id } = req.user;
		const { name, listId, populate, page, pageSize } = req.query;
		const { total, remaining, paginationResult, items } = await List.getList(
			listId,
			_id,
			name,
			populate,
			page,
			pageSize
		);
		if (!items) return res.status(404).send({ message: 'List not found' });
		res.status(200).send({ length: items.length, total, remaining, paginationResult, items });
	}

	static async addList(req, res) {
		const { _id } = req.user;
		const { name } = req.body;
		const list = await List.createList(name, _id);
		await list
			.save()
			.then(() => res.status(201).send({ listId: list._id, create: true, list }))
			.catch(err => {
				if (err.code === 11000)
					res.status(400).send({ error: true, message: 'list already exists.' });
				else throw err;
			});
	}

	static async updateList(req, res) {
		const { id } = req.params;
		const { _id } = req.user;
		const { name } = req.body;
		const { err, status, message, list } = await List.editList(id, name, _id);
		if (err) return res.status(status).send({ error: true, message });
		await list
			.save()
			.then(() => res.status(200).send({ listId: list._id, update: true }))
			.catch(err => {
				if (err.code === 11000)
					res.status(400).send({ error: true, message: 'list name already exists.' });
				else throw err;
			});
	}

	static async addItemToList(req, res) {
		const { _id: userId } = req.user;
		const { id: itemId, listId } = req.body;
		const { err, status, message, list } = await List.addToList(listId, userId, itemId);
		if (err) return res.status(status).send({ error: true, message });
		await list.save();
		res.status(200).send({ listId: list._id, add: true, list });
	}

	static async removeFromList(req, res) {
		const { _id: userId } = req.user;
		const { id: itemId, listId } = req.body;
		const { err, status, message, list } = await List.removeFromList(listId, userId, itemId);
		if (err) return res.status(status).send({ error: true, message });
		await list.save();
		res.status(200).send({ listId: list._id, delete: true, list });
	}

	static async deleteList(req, res) {
		const { _id } = req.user;
		const { id } = req.params;
		const { err, status, message, list } = await List.deleteList(id, _id);
		if (err) return res.status(status).send({ error: true, message });
		res.send({ listId: list._id, delete: true });
	}
}
