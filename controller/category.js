import _ from 'lodash';
import Category from '../model/category.js';

export default class CategoryController {
	// get all items from database and return them as JSON objects
	static async categories(req, res) {
		categoryDebugger(req.headers['user-agent']);
		const { pageNumber, pageSize, sortBy } = req.query;
		const categories = await Category.getCategories(pageNumber, pageSize, sortBy);
		const remainingCategories = await Category.remainingCategories(pageNumber, pageSize, 100);
		res.send({ pageLength: categories.length, remainingCategories, categories });
	}

	// get item by id from database and return it as JSON object
	static async category(req, res) {
		const category = await Category.getCategoryById(req.params.id);
		if (!category) return res.status(404).send({ message: 'Category not found' });
		res.status(200).send({ category });
	}

	// add new item to Database
	static async addCategory(req, res) {
		const { title, parentId } = req.body;
		const { file } = req;
		const { err, status, message, category } = await Category.createCategory(title, file, parentId);
		if (err) return res.status(status).send({ error: true, message });
		await category
			.save()
			.then(() => res.status(201).send({ create: true, category }))
			.catch(err => {
				if (err.code === 11000)
					res.status(400).send({ error: true, message: 'This category already exists.' });
				else throw err;
			});
	}

	static async updateCategory(req, res) {
		const { id } = req.params;
		const { title } = req.body;
		const { file } = req;
		const { err, status, message, category } = await Category.editCategory(id, title, file);
		if (err) return res.status(status).send({ error: true, message });
		await category.save();
		res.status(200).send({ update: true, category });
	}

	static async deleteCategory(req, res) {
		const { id } = req.params;
		const { err, status, message, category } = await Category.deleteCategory(id);
		if (err) return res.status(status).send({ error: true, message });
		res.send({ categoryid: category._id, delete: true });
	}
}
