const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
	{
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		contactPhone: {
			type: String,
			required: true,
			match: /^([\+][2])?[0][1][0125][0-9]{8}$/
		},
		status: {
			type: String,
			required: true,
			lowercase: true,
			trim: true,
			default: 'pickup',
			enum: {
				values: ['pickup', 'shipping', 'shipped'],
				message: '{VALUE} is not valid. Must be pickup, shipping, or shipped'
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
		address: {
			type: String,
			required: true,
			minLength: 3,
			maxLength: 1000
		},
		items: [
			{
				_id: false,
				itemId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Item',
					required: true
				},
				name: {
					type: String,
					required: true,
					trim: true,
					minLength: 3,
					maxLength: 255,
					match: /^[A-Za-z][A-Za-z0-9 ]{3,255}$/g
				},
				quantity: {
					type: Number,
					required: true,
					min: 0,
					get: v => Math.round(v),
					set: v => Math.round(v)
				},
				price: {
					type: Number,
					required: true,
					min: 0,
					get: v => (Math.round(v * 100) / 100).toFixed(2),
					set: v => (Math.round(v * 100) / 100).toFixed(2)
				}
			}
		],
		bill: {
			type: Number,
			required: true,
			default: 0,
			min: 0,
			get: v => (Math.round(v * 100) / 100).toFixed(2),
			set: v => (Math.round(v * 100) / 100).toFixed(2)
		}
	},
	{
		timestamps: true
	}
);

const Order = mongoose.model('Order', orderSchema, 'order');
module.exports = Order;
