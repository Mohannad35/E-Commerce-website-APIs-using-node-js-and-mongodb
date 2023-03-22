const Brand = require('../model/brand');
const _ = require('lodash');

class BrandController {
	// get all items from database and return them as JSON objects
	static async brands(req, res) {
		const { query } = req;
		const { total, remaining, paginationResult, brands } = await Brand.getBrands(query);
		res.send({ length: brands.length, total, remaining, paginationResult, brands });
	}

	// get item by id from database and return it as JSON object
	static async brand(req, res) {
		const brand = await Brand.getBrandById(req.params.id);
		if (!brand) return res.status(404).send({ message: 'Brand not found' });
		res.status(200).send({ brand });
	}

	// add new item to Database
	static async addBrand(req, res) {
		const { name } = req.body;
		const { file } = req;
		const { err, status, message, brand } = await Brand.createBrand(name, file);
		if (err) return res.status(status).send({ error: true, message });
		await brand.save();
		res.status(201).send({ create: true, brand });
	}

	static async updateBrand(req, res) {
		const { id } = req.params;
		const { name } = req.body;
		const { file } = req;
		const { err, status, message, brand } = await Brand.editBrand(id, name, file);
		if (err) return res.status(status).send({ error: true, message });
		await brand.save();
		res.status(200).send({ update: true, brand });
	}

	static async deleteBrand(req, res) {
		const { id } = req.params;
		const { err, status, message, brand } = await Brand.deleteBrand(id);
		if (err) return res.status(status).send({ error: true, message });
		res.send({ brandid: brand._id, delete: true, brand });
	}
}

module.exports = BrandController;
