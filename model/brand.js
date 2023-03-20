import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			minLength: 3,
			maxLength: 255
		},
		img: {
			type: String
		}
	},
	{
		timestamps: true
	}
);

brandSchema.statics.getBrands = async function (query) {
	let { name, skip, limit, sort, pageNumber, pageSize } = query;
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
	let brands;
	if (name) {
		name = new RegExp(name.replace('-', ' '), 'i');
		brands = await Brand.find({ name }, {}, { skip, limit, sort });
	} else brands = await Brand.find({}, {}, { skip, limit, sort });
	const totalBrands = await Brand.countDocuments();
	return { pageNumber, pageSize, totalBrands, brands };
};

brandSchema.statics.getBrandById = async function (id) {
	return await Brand.findById(id);
};

brandSchema.statics.createBrand = async function (name, img) {
	let brand = await Brand.findOne({ name });
	if (brand) return { err: true, status: 400, message: 'This brand already exists' };
	brand = new Brand({ name, img });
	return { brand };
};

brandSchema.statics.editBrand = async function (id, name = null, img = null) {
	let brand = await Brand.findById(id);
	if (!brand) return { err: true, status: 404, message: 'Brand not found' };
	if (name) brand.name = name;
	if (img) brand.img = img;
	return { brand };
};

brandSchema.statics.deleteBrand = async function (id) {
	const brand = await Brand.findById(id);
	if (!brand) return { err: true, status: 404, message: 'Brand not found' };
	await Brand.deleteOne({ _id: brand._id });
	return { brand };
};

const Brand = mongoose.model('Brand', brandSchema, 'brand');
export default Brand;
