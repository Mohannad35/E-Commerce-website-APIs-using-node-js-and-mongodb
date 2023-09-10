import mongoose from 'mongoose';
import sgMail from '@sendgrid/mail';
import moment from 'moment';
import config from 'config';
import Item from './item.js';
import Cart from './cart.js';
import User from './user.js';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const orderSchema = new mongoose.Schema(
	{
		code: { type: String, required: true, minLength: 3, maxLength: 1000 },
		owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		contactPhone: { type: String, required: true, match: /^([\+][2])?[0][1][0125][0-9]{8}$/ },
		status: {
			type: String,
			required: true,
			lowercase: true,
			trim: true,
			default: 'pending',
			enum: {
				values: ['pending', 'on way', 'received', 'cancelled'],
				message: '{VALUE} is not valid. Must be pending, on way, received, or cancelled'
			}
		},
		paymentMethod: {
			type: String,
			lowercase: true,
			trim: true,
			required: true,
			default: 'cash',
			enum: {
				values: ['cash', 'credit card'],
				message: '{VALUE} is not valid. Must be cash or credit card'
			}
		},
		address: { type: String, required: true, minLength: 3, maxLength: 1000 },
		coupon: [{ type: String, minLength: 3, maxLength: 1000 }],
		vendors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
		items: [
			{
				_id: false,
				item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
				name: {
					type: String,
					required: true,
					trim: true,
					minLength: 3,
					maxLength: 255,
					match: /^[\p{L}].*$/u
				},
				quantity: { type: Number, required: true, min: [0, 'Invalid quantity'] },
				price: { type: Number, required: true, min: [0, 'Invalid price'] },
				priceAfter: { type: Number, min: [0, 'Invalid price'] },
				itemState: {
					type: String,
					lowercase: true,
					trim: true,
					default: 'pending',
					enum: {
						values: ['pending', 'on way', 'received'],
						message: '{VALUE} is not valid. Must be pending, on way, or received'
					}
				}
			}
		],
		bill: { type: Number, required: true, default: 0, min: [0, 'Invalid bill'] },
		billBefore: { type: Number, default: 0, min: [0, 'Invalid bill'] }
	},
	{
		timestamps: true
	}
);

orderSchema.statics.getOrders = async function (user, query) {
	let { code, skip, sort, limit, pageNumber, pageSize, all } = query;

	limit = pageNumber || pageSize ? undefined : limit;
	skip = pageNumber || pageSize ? undefined : skip;
	pageSize = pageNumber && !pageSize ? 20 : pageSize;
	pageNumber = !pageNumber && pageSize ? 1 : pageNumber;
	skip = (pageNumber - 1) * pageSize || skip || 0;
	limit = pageSize || limit || 1000;
	sort = sort || '_id';
	sort = sort.split(',').join(' ');
	code = code ? new RegExp(code, 'i') : /.*/;

	let orders = [],
		total = 0;
	if (user.accountType === 'admin') {
		if (all === 'true') {
			orders = await Order.find(
				{ code },
				{},
				{ skip: (pageNumber - 1) * pageSize, limit: pageSize, sort }
			)
				.populate('owner', 'name email')
				.populate('items.item')
				.collation({ locale: 'en' });
			total = await Order.countDocuments({ code });
		} else {
			orders = await Order.find(
				{ code, owner: user._id },
				{},
				{ skip: (pageNumber - 1) * pageSize, limit: pageSize, sort }
			)
				.populate('owner', 'name email')
				.populate('items.item')
				.collation({ locale: 'en' });
			total = await Order.countDocuments({ code, owner: user._id });
		}
	} else {
		orders = await Order.find(
			{ code, owner: user._id },
			{},
			{ skip: (pageNumber - 1) * pageSize, limit: pageSize, sort }
		)
			.populate('owner', 'name email')
			.populate('items.item')
			.collation({ locale: 'en' });
		total = await Order.countDocuments({ code, owner: user._id });
	}

	const numberOfPages = Math.ceil(total / pageSize);
	const remaining = total - skip - limit > 0 ? total - skip - limit : 0;
	if (pageNumber)
		return {
			total,
			remaining,
			paginationResult: {
				currentPage: parseInt(pageNumber),
				numberOfPages,
				limit: parseInt(pageSize)
			},
			orders
		};
	else return { total, remaining, orders };
};

orderSchema.statics.getOrder = async function (id) {
	const order = await Order.findById(id).populate('owner', 'name email').populate('items.item');
	if (!order) return { err: true, status: 404, message: 'Order not found' };
	return { order };
};

async function updateItems(cart, order) {
	let abortedItemId = null;
	for (let item of cart.items) {
		const itemInDb = await Item.findById(item.item, 'quantity');
		itemInDb.quantity -= item.quantity;
		if (itemInDb.quantity < 0) {
			abortedItemId = itemInDb._id;
			break;
		} else {
			await itemInDb.save();
		}
	}
	if (abortedItemId) {
		for (let item of cart.items) {
			const itemInDB = await Item.findById(item.item, 'quantity');
			if (abortedItemId.equals(itemInDB._id)) {
				await Order.deleteOne({ _id: order._id });
				return { isAborted: true, abortedItemName: item.name };
			}
			itemInDB.quantity += item.quantity;
			await itemInDB.save();
		}
	}
	return { isAborted: false };
}

orderSchema.statics.checkout = async function (owner, paymentMethod, contactPhone, address) {
	paymentMethod = paymentMethod || 'cash';
	const cart = await Cart.findOne({ owner }).populate('items.item');
	if (!cart || cart.items.length === 0)
		return { err: true, status: 404, message: 'Cart is empty!' };

	const { items, bill, billBefore, coupon } = cart;
	let vendors = [];
	items.forEach(item => {
		if (!vendors.some(value => value.equals(item.item.owner))) vendors.push(item.item.owner);
	});

	const code = `${moment().format('YYYYMMDD')}${generateCode(5)}`;
	const order = new Order({
		code,
		owner,
		vendors,
		coupon,
		items,
		bill,
		billBefore,
		paymentMethod,
		contactPhone,
		address
	});

	const { isAborted, abortedItemName: name } = await updateItems(cart, order);

	if (isAborted)
		return { err: true, status: 400, message: `Not enough quantity of ${name} is available` };

	let index = 0;
	for (let vendor of vendors) {
		index++;
		let vendorItems = [];
		const user = await User.findOne({ _id: vendor });
		const link = `${process.env.CLIENT_URL}user/allorders`;
		const msg = {
			to: user.email,
			from: {
				email: 'mohannadragab53@gmail.com',
				name: 'E-commerce Team'
			},
			subject: 'New Order',
			html:
				'Hello ' +
				user.name +
				',<br> Please check your page for new order details.<br><a href=' +
				link +
				'>Click here for details</a>'
		};

		await sgMail.send(msg).catch(error => logger.error(error.message, error));

		items.forEach(item => {
			if (vendor.equals(item.item.owner)) vendorItems.push(item);
		});

		const bill = vendorItems.reduce(
			(acc, cur) => acc + cur.quantity * (cur.priceAfter ? cur.priceAfter : cur.price),
			0
		);
		const billBefore = vendorItems.reduce((acc, cur) => acc + cur.quantity * cur.price, 0);

		await Order.create({
			code: `${code}-V${pad(index, 2)}`,
			owner: vendor,
			coupon,
			items: vendorItems,
			bill,
			billBefore,
			paymentMethod,
			contactPhone,
			address
		});
	}

	await Cart.findByIdAndDelete(cart._id);

	return { order };
};

orderSchema.statics.editOrderStatus = async function (id, owner, status) {
	let order = await Order.findById(id);
	if (!order) return { err: true, status: 404, message: 'No order found' };

	const user = await User.findById(owner);
	if (!(order.owner.equals(owner) || user.accountType === 'admin'))
		return { err: true, resStatus: 403, message: 'Access denied' };

	let code = new RegExp(order.code.replace(/-.*/, ''), 'i');
	const orders = await Order.find({ code });

	if (status === 'cancelled') {
		let flag = true;
		orders.forEach(order => {
			if (order.status !== 'pending') flag = false;
		});
		if (flag) await Order.updateMany({ code }, { $set: { status: 'cancelled' } });
		else return { err: true, resStatus: 406, message: `Order can't be cancelled` };
	} else if (status === 'on way') {
		let flag = true;
		orders.forEach(order => {
			if (['cancelled', 'received'].includes(order.status)) flag = false;
		});
		if (flag)
			await Order.updateMany(
				{ $or: [{ code: order.code.replace(/-.*/, '') }, { _id: id }] },
				{ $set: { status: 'on way' } }
			);
		else return { err: true, resStatus: 406, message: `Order can't be on way` };
	} else if (status === 'received') {
		let flag = true;
		orders.forEach(order => {
			if (order.status !== 'on way') flag = false;
		});
		if (flag) await Order.updateMany({ code }, { $set: { status: 'received' } });
		else return { err: true, resStatus: 406, message: `Order can't be received` };
	}

	code = order.code.replace(/-.*/, '');
	order = await Order.findOne({ code });
	order.items.forEach(
		async item => await Item.updateOne({ _id: item.item }, { $inc: { quantity: item.quantity } })
	);

	return { order };
};

const Order = mongoose.model('Order', orderSchema, 'order');
export default Order;

function generateCode(length) {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}
	return result;
}

function pad(num, size) {
	num = num.toString();
	while (num.length < size) num = '0' + num;
	return num;
}
