import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
	{
		userId: {
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
export default Request;
