const mongoose = require("mongoose");
const ObjectID = mongoose.Schema.Types.ObjectId;

const itemSchema = new mongoose.Schema(
	{
		owner: {
			type: ObjectID,
			required: true,
			ref: "User",
		},
		name: {
			type: String,
			required: true,
			trim: true,
			validate(value) {
				if (!value.match(/^[A-Za-z][A-Za-z0-9 ]{3,29}$/g)) {
					throw new Error("{VALUE} must contain only alphanumeric characters with length (8,30)");
				}
			},
		},
		description: {
			type: String,
			required: true,
		},
		category: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
			min: 0,
		},
		quantity: {
			type: Number,
			required: true,
			min: 0,
		},
	},
	{
		timestamps: true,
	}
);

const Item = mongoose.model("Item", itemSchema);
module.exports = Item;
