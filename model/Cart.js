const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
	{
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		items: [
			{
				_id: false,
				itemId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Item',
					required: true,
				},
				name: {
					type: String,
					required: true,
					trim: true,
					minLength: 3,
					maxLength: 255,
					match: /^[A-Za-z][A-Za-z0-9 ]{3,255}$/g,
				},
				quantity: {
					type: Number,
					required: true,
					min: 0,
					get: v => Math.round(v),
					set: v => Math.round(v),
				},
				price: {
					type: Number,
					required: true,
					min: 0,
					get: v => (Math.round(v * 100) / 100).toFixed(2),
					set: v => (Math.round(v * 100) / 100).toFixed(2),
				},
			},
		],
		bill: {
			type: Number,
			required: true,
			default: 0,
			min: 0,
			get: v => (Math.round(v * 100) / 100).toFixed(2),
			set: v => (Math.round(v * 100) / 100).toFixed(2),
		},
	},
	{
		timestamps: true,
	}
);

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
