import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
			minLength: 3,
			maxLength: 255
		},
		parent: {
			_id: false,
			parentId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Category'
			},
			parentTitle: {
				type: String,
				trim: true,
				minLength: 3,
				maxLength: 255
			}
		},
		slug: { type: String, slug: ['title', 'parent.parentTitle'] }
	},
	{
		timestamps: true
	}
);

categorySchema.statics.getCategories = async function (query) {
	let { title, parentId, slug, skip, limit, pageNumber, pageSize, sort } = query;
	if (pageNumber || pageSize) {
		skip = undefined;
		limit = undefined;
	}
	if (pageNumber && !pageSize) pageSize = 20;
	if (!pageNumber && pageSize) pageNumber = 1;
	skip = (pageNumber - 1) * pageSize || skip || 0;
	limit = pageSize || limit || 1000;
	sort = sort || 'title';
	let categories;
	if (title) {
		title = new RegExp(title.replace('-', ' '), 'i');
		categories = await Category.find({ title }, {}, { skip, limit, sort });
	} else if (parentId)
		categories = await Category.find({ 'parent.parentId': parentId }, {}, { skip, limit, sort });
	else if (slug) {
		slug = new RegExp(slug, 'i');
		categories = await Category.find({ slug }, {}, { skip, limit, sort });
	} else categories = await Category.find({}, {}, { skip, limit, sort });
	const total = await Category.countDocuments();
	return { pageNumber, pageSize, total, categories };
};

categorySchema.statics.getMainCategories = async function (query) {
	let { skip, limit, pageNumber, pageSize, sort } = query;
	if (pageNumber || pageSize) {
		skip = undefined;
		limit = undefined;
	}
	if (pageNumber && !pageSize) pageSize = 20;
	if (!pageNumber && pageSize) pageNumber = 1;
	skip = (pageNumber - 1) * pageSize || skip || 0;
	limit = pageSize || limit || 1000;
	sort = sort || 'title';
	let categories = await Category.find({ parent: null }, {}, { skip, limit, sort });
	const total = await Category.countDocuments({ parent: null });
	return { pageNumber, pageSize, total, categories };
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

categorySchema.statics.createCategory = async function (title, parentId = null) {
	if (parentId) {
		var parent = await Category.findById(parentId, 'title');
		if (!parent) return { err: true, status: 404, message: 'Parent Category not found' };
	}
	const category = new Category({
		title,
		parent: parentId ? { parentId: parent._id, parentTitle: parent.title } : null
	});
	return { category };
};

categorySchema.statics.editCategory = async function (id, title = null, parentId = null) {
	let category = await Category.findById(id);
	if (!category) return { err: true, status: 404, message: 'Category not found' };
	if (title) category.title = title;
	if (parentId) {
		var parent = await Category.findById(parentId, 'title');
		if (!parent) return { err: true, status: 404, message: 'Parent Category not found' };
		category.parent = { parentId: parent._id, parentTitle: parent.title };
	}
	return { category };
};

categorySchema.statics.deleteCategory = async function (id) {
	const category = await Category.findById(id);
	if (!category) return { err: true, status: 404, message: 'Category not found' };
	await Category.deleteOne({ _id: category._id });
	return { category };
};

const Category = mongoose.model('Category', categorySchema, 'category');
export default Category;
