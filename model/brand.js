import { unlink } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';
import logger from '../middleware/logger.js';
import config from 'config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const brandSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, unique: true, trim: true, minLength: 2, maxLength: 255 },
		img: { type: String }
	},
	{
		timestamps: true
	}
);

brandSchema.statics.getBrands = async function (query) {
	let { name, skip, limit, sort, pageNumber, pageSize } = query;
	let total = 0;
	let brands;
	if (pageNumber || pageSize) {
		limit = undefined;
		skip = undefined;
	}
	if (pageNumber && !pageSize) pageSize = 20;
	if (!pageNumber && pageSize) pageNumber = 1;
	skip = (pageNumber - 1) * pageSize || skip || 0;
	limit = pageSize || limit || 1000;
	sort = sort || 'name';
	if (sort) sort = sort.split(',').join(' ');
	if (name) {
		name = new RegExp(name.replace('-', ' '), 'i');
		brands = await Brand.find({ name }, {}, { skip, limit, sort }).collation({ locale: 'en' });
		total = await Brand.countDocuments({ name });
	} else {
		brands = await Brand.find({}, {}, { skip, limit, sort }).collation({ locale: 'en' });
		total = await Brand.countDocuments({});
	}
	const numberOfPages = Math.ceil(total / pageSize);
	const remaining = total - (skip + limit) > 0 ? total - (skip + limit) : 0;
	if (pageNumber)
		return {
			total,
			remaining,
			paginationResult: {
				currentPage: parseInt(pageNumber),
				numberOfPages,
				limit: parseInt(pageSize)
			},
			brands
		};
	else return { total, remaining, brands };
};

brandSchema.statics.getBrandById = async function (id) {
	return await Brand.findById(id);
};

brandSchema.statics.createBrand = async function (name, img) {
	let brand = await Brand.findOne({ name });
	if (brand) return { err: true, status: 400, message: 'This brand already exists' };
	brand = new Brand({
		name,
		img: `${config.get('server_url') || 'http://localhost:5000/'}brands/${img.filename}`
	});
	return { brand };
};

brandSchema.statics.editBrand = async function (id, name = null, img = null) {
	let brand = await Brand.findById(id);
	if (!brand) return { err: true, status: 404, message: 'Brand not found' };
	if (name) brand.name = name;
	if (img) {
		await unlink(
			`${__dirname.replace(/model/, '')}public/brands/${brand.img.replace(/.*brands\//, '')}`,
			err => err && logger.error(err.message, err)
		);
		brand.img = `${config.get('server_url') || 'http://localhost:5000/'}brands/${img.filename}`;
	}
	return { brand };
};

brandSchema.statics.deleteBrand = async function (id) {
	const brand = await Brand.findById(id);
	if (!brand) return { err: true, status: 404, message: 'Brand not found' };
	await unlink(
		`${__dirname.replace(/model/, '')}public/brands/${brand.img.replace(/.*brands\//, '')}`,
		err => err && logger.error(err.message, err)
	);
	await Brand.deleteOne({ _id: brand._id });
	return { brand };
};

const Brand = mongoose.model('Brand', brandSchema, 'brand');
export default Brand;
