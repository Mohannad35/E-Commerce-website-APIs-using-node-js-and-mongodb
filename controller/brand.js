import _ from 'lodash';
import Brand from '../model/brand.js';

export default class BrandController {
	// get all items from database and return them as JSON objects
	static async brands(req, res) {
		const { query } = req;
		const { pageNumber, pageSize, totalBrands, brands } = await Brand.getBrands(query);
		res.send({ pageNumber, pageSize, totalBrands, length: brands.length, brands });
	}

	// get item by id from database and return it as JSON object
	static async brand(req, res) {
		const brand = await Brand.getBrandById(req.params.id);
		if (!brand) return res.status(404).send({ message: 'Brand not found' });
		res.status(200).send({ brand });
	}

	// add new item to Database
	static async addBrand(req, res) {
		const { name, img } = req.body;
		const { err, status, message, brand } = await Brand.createBrand(name, img);
		if (err) return res.status(status).send({ error: true, message });
		await brand.save();
		res.status(201).send({ brandid: brand._id, create: true, brand });
	}

	static async updateBrand(req, res) {
		const { id } = req.params;
		const { name, img } = req.body;
		const { err, status, message, brand } = await Brand.editBrand(id, name, img);
		if (err) return res.status(status).send({ error: true, message });
		await brand.save();
		res.status(200).send({ brandid: brand._id, update: true, brand });
	}

	static async deleteBrand(req, res) {
		const { id } = req.params;
		const { err, status, message, brand } = await Brand.deleteBrand(id);
		if (err) return res.status(status).send({ error: true, message });
		res.send({ brandid: brand._id, delete: true, brand });
	}
}
