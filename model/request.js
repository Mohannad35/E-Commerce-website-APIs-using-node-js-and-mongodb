const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
	{
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		type: {
			type: String
		},
		details: {
			type: String
		}
	},
	{
		timestamps: true
	}
);

const Request = mongoose.model('Request', requestSchema, 'request');
module.exports = Request;
