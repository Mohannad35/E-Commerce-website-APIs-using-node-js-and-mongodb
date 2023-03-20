import _ from 'lodash';
import Category from '../model/category.js';

export default class CategoryController {
	// get all items from database and return them as JSON objects
	static async categories(req, res) {
		const { main, ...query } = req.query;
		// let categories, pageNumber, pageSize, total, result;
		// if (main) categories = await Category.getMainCategories(query);
		// else {
		// 	result = await Category.getCategories(query);
		// 	categories = result.categories;
		// 	pageNumber = result.pageNumber;
		// 	pageSize = result.pageSize;
		// 	total = result.total;
		// }
		const { pageNumber, pageSize, total, categories } =
			main === 'true'
				? await Category.getMainCategories(query)
				: await Category.getCategories(query);
		res.send({ length: categories.length, pageNumber, pageSize, total, categories });
	}

	static async subCategories(req, res) {
		const { id: parentId } = req.params;
		const { pageNumber, pageSize, total, categories } = await Category.getCategories({ parentId });
		res.send({ length: categories.length, pageNumber, pageSize, total, categories });
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
		const { err, status, message, category } = await Category.createCategory(title, parentId);
		if (err) return res.status(status).send({ error: true, message });
		await category
			.save()
			.then(() => res.status(201).send({ categoryid: category._id, create: true, category }))
			.catch(err => {
				if (err.code === 11000)
					res.status(400).send({ error: true, message: 'This category already exists.' });
				else throw err;
			});
	}

	static async updateCategory(req, res) {
		const { id } = req.params;
		const { title, parentId } = req.body;
		if (id === parentId)
			return res.status(400).send({ error: true, message: `id and parentId can't be the same` });
		const { err, status, message, category } = await Category.editCategory(id, title, parentId);
		if (err) return res.status(status).send({ error: true, message });
		await category.save();
		res.status(200).send({ categoryid: category._id, update: true });
	}

	static async deleteCategory(req, res) {
		const { id } = req.params;
		const { err, status, message, category } = await Category.deleteCategory(id);
		if (err) return res.status(status).send({ error: true, message });
		res.send({ categoryid: category._id, delete: true });
	}
}
