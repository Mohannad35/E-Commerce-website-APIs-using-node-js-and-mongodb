import mongoose from 'mongoose';

const rateSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		itemId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Item'
		},
		vendorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		rateValue: {
			type: Number,
			required: true,
			min: [0, 'Invalid rate value'],
			min: [5, 'Invalid rate value']
		},
		review: {
			type: String,
			trim: true,
			minLength: 3,
			maxLength: 2048
		}
	},
	{
		timestamps: true
	}
);

rateSchema.statics.getRates = async function (query) {
	const { userId, itemId, vendorId } = query;
	let rates;
	if (userId) rates = await Rate.find({ userId }).collation({ locale: 'en' });
	if (itemId) rates = await Rate.find({ itemId }).collation({ locale: 'en' });
	if (vendorId) rates = await Rate.find({ vendorId }).collation({ locale: 'en' });
	return rates;
};

rateSchema.statics.getRate = async function (id, populate) {
	if (populate)
		return await Rate.findById(id)
			.populate('userId', 'name email')
			.populate('vendorId', 'name email')
			.populate('itemId');
	return await Rate.findById(id);
};

rateSchema.statics.createRate = async function (userId, vendorId, itemId, rateValue, review) {
	const rate = new Rate({ userId, vendorId, itemId, rateValue, review });
	return rate;
};

rateSchema.statics.editList = async function (rateId, userId, rateValue, review) {
	let rate = Rate.findById(rateId);
	if (userId !== rate.userId) return { err: true, status: 403, message: 'Access denied' };
	if (rateValue) rate.rateValue = rateValue;
	if (review) rate.review = review;
	return { rate };
};

rateSchema.statics.deleteRate = async function (rateId, userId) {
	let rate = Rate.findById(rateId);
	if (userId !== rate.userId) return { err: true, status: 403, message: 'Access denied' };
	await Rate.deleteOne({ _id: rateId });
	return { rate };
};

const Rate = mongoose.model('Rate', rateSchema, 'rate');
export default Rate;
