const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
	{
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
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
		description: {
			type: String,
			required: true
		},
		// should we make a category collection?
		category: {
			type: String,
			required: true
		},
		price: {
			type: Number,
			required: true,
			min: 0
		},
		quantity: {
			type: Number,
			required: true,
			min: [0, 'Invalid quantity']
		}
	},
	{
		timestamps: true
	}
);

const Item = mongoose.model('Item', itemSchema, 'item');
module.exports = Item;
