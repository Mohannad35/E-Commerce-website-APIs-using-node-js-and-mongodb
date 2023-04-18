import Item from './item.js';
import mongoose from 'mongoose';
import slug from 'mongoose-slug-updater';
mongoose.plugin(slug);

const rateSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		itemId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Item',
			required: true
		},
		rateValue: {
			type: Number,
			required: true,
			min: [0, 'Invalid rate value'],
			max: [5, 'Invalid rate value']
		},
		review: {
			type: String,
			trim: true,
			minLength: 3,
			maxLength: 2048
		},
		slug: { type: String, slug: ['userId', 'itemId'] }
	},
	{
		timestamps: true
	}
);
rateSchema.index({ slug: 1 }, { unique: true });

rateSchema.statics.getRates = async function (query) {
	let { skip, sort, limit, pageNumber, pageSize, userId, itemId } = query;
	limit = pageNumber || pageSize ? undefined : limit;
	skip = pageNumber || pageSize ? undefined : skip;
	pageSize = pageNumber && !pageSize ? 20 : pageSize;
	pageNumber = !pageNumber && pageSize ? 1 : pageNumber;
	skip = (pageNumber - 1) * pageSize || skip || 0;
	limit = pageSize || limit || 1000;
	sort = sort || '_id';
	sort = sort.split(',').join(' ');

	userId = userId ? userId.split(',') : undefined;
	itemId = itemId ? itemId.split(',') : undefined;

	let rate, rates, total;
	itemId &&
		userId &&
		(rate = await Rate.findOne(
			{
				itemId: { $in: itemId },
				userId: { $in: userId }
			},
			{},
			{ skip, limit, sort }
		)
			.populate('userId', 'name email')
			.collation({ locale: 'en' }));
	rates = rate
		? [
				rate,
				...(await Rate.find(
					{
						itemId: itemId ? { $in: itemId } : { $exists: true },
						userId: userId ? { $nin: userId } : { $exists: true }
					},
					{},
					{ skip, limit: --limit, sort }
				)
					.populate('userId', 'name email')
					.collation({ locale: 'en' }))
		  ]
		: await Rate.find(
				{
					itemId: itemId ? { $in: itemId } : { $exists: true },
					userId: userId ? { $nin: userId } : { $exists: true }
				},
				{},
				{ skip: --skip, limit, sort }
		  )
				.populate('userId', 'name email')
				.collation({ locale: 'en' });
	total = await Rate.countDocuments({ itemId: itemId ? { $in: itemId } : { $exists: true } });

	const numberOfPages = Math.ceil(total / pageSize);
	const remaining =
		total - (rate ? skip : skip + 1) - (rate ? limit + 1 : limit) > 0
			? total - (rate ? skip : skip + 1) - (rate ? limit + 1 : limit)
			: 0;
	if (pageNumber)
		return {
			total,
			remaining,
			paginationResult: {
				currentPage: parseInt(pageNumber),
				numberOfPages,
				limit: parseInt(pageSize)
			},
			rates
		};
	else return { total, remaining, rates };
};

rateSchema.statics.getRate = async function (id, populate) {
	if (populate) return await Rate.findById(id).populate('userId', 'name email').populate('itemId');
	return await Rate.findById(id);
};

rateSchema.statics.createRate = async function (userId, itemId, rateValue, review) {
	const item = await Item.findById(itemId);
	if (!item) return { err: true, status: 404, message: 'Item not found' };
	const rate = new Rate({ userId, itemId, rateValue, review });
	try {
		await rate.save();
	} catch (err) {
		if (err.code === 11000) return { err: true, status: 400, message: 'Rate already exists' };
		else throw err;
	}
	item.ratingCount++;
	item.rating = (item.rating * (item.ratingCount - 1) + rateValue) / item.ratingCount;
	item.rating = Math.round((item.rating + Number.EPSILON) * 10) / 10;
	item.save();
	return { rate };
};

rateSchema.statics.editRate = async function (rateId, userId, rateValue, review) {
	let rate = await Rate.findById(rateId);
	if (!rate) return { err: true, status: 404, message: 'Rate not found' };
	if (!rate.userId.equals(userId)) return { err: true, status: 403, message: 'Access denied' };
	const item = await Item.findById(rate.itemId);
	if (!item) return { err: true, status: 404, message: 'Item not found' };
	if (rateValue) {
		item.rating = (item.rating * item.ratingCount - rate.rateValue + rateValue) / item.ratingCount;
		item.rating = Math.round((item.rating + Number.EPSILON) * 10) / 10;
		item.save();
		rate.rateValue = rateValue;
	}
	if (review) rate.review = review;
	return { rate };
};

rateSchema.statics.deleteRate = async function (rateId, userId) {
	let rate = await Rate.findById(rateId);
	if (!rate) return { err: true, status: 404, message: 'Rate not found' };
	if (!rate.userId.equals(userId)) return { err: true, status: 403, message: 'Access denied' };
	const item = await Item.findById(rate.itemId);
	if (!item) return { err: true, status: 404, message: 'Item not found' };
	await Rate.deleteOne({ _id: rateId });
	item.ratingCount--;
	item.rating = (item.rating * (item.ratingCount + 1) - rate.rateValue) / item.ratingCount;
	item.rating = Math.round((item.rating + Number.EPSILON) * 10) / 10;
	item.save();
	return { rate };
};

const Rate = mongoose.model('Rate', rateSchema, 'rate');
export default Rate;
