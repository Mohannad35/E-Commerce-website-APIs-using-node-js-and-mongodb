import { unlink } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';
import logger from '../middleware/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const categorySchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true, minLength: 3, maxLength: 255 },
		img: { type: String, trim: true },
		isParent: { type: Boolean, default: false },
		parent: {
			_id: false,
			parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
			parentTitle: { type: String, trim: true, minLength: 3, maxLength: 255 }
		},
		slug: { type: String, slug: ['title', 'parent.parentTitle'] }
	},
	{
		timestamps: true
	}
);

categorySchema.statics.getCategories = async function (query) {
	let { title, parentId, isParent, main, slug, skip, limit, pageNumber, pageSize, sort } = query;
	if (pageNumber || pageSize) {
		skip = undefined;
		limit = undefined;
	}
	if (pageNumber && !pageSize) pageSize = 20;
	if (!pageNumber && pageSize) pageNumber = 1;
	skip = (pageNumber - 1) * pageSize || skip || 0;
	limit = pageSize || limit || 1000;
	sort = sort || 'title';
	let categories, total;
	if (main) {
		categories = await Category.find({ parent: null }, {}, { skip, limit, sort }).collation({
			locale: 'en'
		});
		total = await Category.countDocuments({ parent: null });
	} else if (title) {
		title = new RegExp(title.replace('-', ' '), 'i');
		categories = await Category.find({ title }, {}, { skip, limit, sort }).collation({
			locale: 'en'
		});
		total = await Category.countDocuments({ title });
	} else if (parentId) {
		categories = await Category.find(
			{ 'parent.parentId': parentId },
			{},
			{ skip, limit, sort }
		).collation({ locale: 'en' });
		total = await Category.countDocuments({ 'parent.parentId': parentId });
	} else if (isParent === 'true') {
		categories = await Category.find({ isParent: true }, {}, { skip, limit, sort }).collation({
			locale: 'en'
		});
		total = await Category.countDocuments({ isParent: true });
	} else if (isParent === 'false') {
		categories = await Category.find({ isParent: false }, {}, { skip, limit, sort }).collation({
			locale: 'en'
		});
		total = await Category.countDocuments({ isParent: false });
	} else if (slug) {
		slug = new RegExp(slug, 'i');
		categories = await Category.find({ slug }, {}, { skip, limit, sort }).collation({
			locale: 'en'
		});
		total = await Category.countDocuments({ slug });
	} else {
		categories = await Category.find({}, {}, { skip, limit, sort }).collation({ locale: 'en' });
		total = await Category.countDocuments();
	}
	const numberOfPages = Math.ceil(total / pageSize);
	const remaining = total - skip - limit > 0 ? total - skip - limit : 0;
	return {
		total,
		remaining,
		paginationResult: {
			currentPage: parseInt(pageNumber),
			numberOfPages,
			limit: parseInt(pageSize)
		},
		categories
	};
};

categorySchema.statics.remainingCategories = async function (
	pageNumber = 1,
	pageSize = 20,
	limit = 100
) {
	const count = await Category.countDocuments({}, { skip: pageNumber * pageSize, limit });
	return count <= 100 ? count : '+100';
};

categorySchema.statics.getCategoryById = async function (id) {
	return await Category.findById(id);
};

categorySchema.statics.createCategory = async function (title, img, parentId = null) {
	if (parentId) {
		var parent = await Category.findById(parentId, 'title');
		if (!parent) return { err: true, status: 404, message: 'Parent Category not found' };
		if (!parent.isParent) {
			parent.isParent = true;
			await parent.save();
		}
	}
	const category = new Category({
		title,
		img: `http://localhost:5000/categories/${img.filename}`,
		parent: parentId ? { parentId: parent._id, parentTitle: parent.title } : null
	});
	return { category };
};

categorySchema.statics.editCategory = async function (id, title = null, img = null) {
	let category = await Category.findById(id);
	if (!category) return { err: true, status: 404, message: 'Category not found' };
	if (title) category.title = title;
	if (img) {
		await unlink(
			`${__dirname.replace(/model/, '')}public/categories/${category.img.replace(
				/.*categories\//,
				''
			)}`,
			err => err && logger.error(err.message, err)
		);
		category.img = `http://localhost:5000/categories/${img.filename}`;
	}
	return { category };
};

categorySchema.statics.deleteCategory = async function (id) {
	const category = await Category.findById(id);
	if (!category) return { err: true, status: 404, message: 'Category not found' };
	await unlink(
		`${__dirname.replace(/model/, '')}public/categories/${category.img.replace(
			/.*categories\//,
			''
		)}`,
		err => err && logger.error(err.message, err)
	);
	await Category.deleteOne({ _id: category._id });
	return { category };
};

const Category = mongoose.model('Category', categorySchema, 'category');
export default Category;
