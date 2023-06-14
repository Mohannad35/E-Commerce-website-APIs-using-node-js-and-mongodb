import Joi from 'joi';
import smn from 'joi-objectid';
import moment from 'moment';
import passwordComplexity from 'joi-password-complexity';

Joi.objectId = smn(Joi);
const complexityOptions = {
	min: 8,
	max: 30,
	lowerCase: 1,
	upperCase: 1,
	numeric: 1,
	symbol: 1,
	requirementCount: 3
};
const joiName = Joi.string()
	.min(2)
	.max(255)
	.pattern(/^[\p{L}].*$/u)
	.message('name should start with a letter');
const joiEmail = Joi.string().email().message('{:[.]} is not a valid email address');
const joiPhoneNumber = Joi.string()
	.pattern(/^([\+][2])?[0][1][0125][0-9]{8}$/)
	.message('{:[.]} is not a valid phone number');
const JoiConfirmPassword = Joi.any()
	.label('Confirm password')
	.equal(Joi.ref('password'))
	.messages({ 'any.only': `{{#label}} doesn't match` });
const JoiDate = Joi.date()
	.less(moment().subtract(10, 'years').format('YYYY-MM-DD'))
	.message('You must be older than 10 years')
	.greater(moment().subtract(120, 'years').format('YYYY-MM-DD'))
	.message('You must be younger than 120 years');
const joiAccountType = Joi.string().valid('client', 'admin', 'vendor');
const joiId = Joi.objectId();

export default class UserValidator {
	static id(data) {
		const Schema = Joi.object({
			id: joiId.required()
		});
		return Schema.validate(data, { convert: false, abortEarly: false });
	}

	static getUsers(opts) {
		const Schema = Joi.object({
			pageNumber: Joi.string()
				.pattern(/^[0-9]+$/)
				.message('pageNumber should be a positive integer'),
			pageSize: Joi.string()
				.pattern(/^[0-9]+$/)
				.message('pageSize should be a positive integer'),
			age: Joi.string()
				.pattern(/^[0-9]+$/)
				.message('age should be a positive integer'),
			maxAge: Joi.string()
				.pattern(/^[0-9]+$/)
				.message('maxAge should be a positive integer'),
			sort: Joi.string()
				.pattern(/^[A-Za-z_\-,.]+$/)
				.message('sort should only contain letters and _-,.'),
			accountType: Joi.string()
				.pattern(/^[A-Za-z]+$/)
				.message('accountType should only contain letters'),
			gender: Joi.string()
				.pattern(/^[A-Za-z]+$/)
				.message('gender should only contain letters'),
			name: Joi.string(),
			email: Joi.string()
		});
		return Schema.validate(opts, { convert: false, abortEarly: false });
	}

	static getStats(opts) {
		const Schema = Joi.object({
			skip: Joi.string()
				.pattern(/^[0-9]+$/)
				.message('skip should be a positive integer'),
			limit: Joi.string()
				.pattern(/^[0-9]+$/)
				.message('limit should be a positive integer'),
			date: Joi.string()
				.pattern(/^[0-9_,.\-]+$/)
				.message('date should be YYYY-MM-DD or YYYY-MM-DD,YYYY-MM-DD'),
			accountType: Joi.string()
				.pattern(/^[A-Za-z]+$/)
				.message('accountType should only contain letters'),
			gender: Joi.string()
				.pattern(/^[A-Za-z]+$/)
				.message('gender should only contain letters')
		});
		return Schema.validate(opts, { convert: false, abortEarly: false });
	}

	static signup(account) {
		const Schema = Joi.object({
			name: joiName.required(),
			email: joiEmail.required(),
			phoneNumber: joiPhoneNumber.required(),
			password: passwordComplexity(complexityOptions, 'Password').required(),
			confirmPassword: JoiConfirmPassword,
			birthday: JoiDate,
			gender: Joi.string().allow('male', 'female'),
			city: Joi.string().min(3).max(1024),
			address: Joi.string().min(3).max(1024),
			companyName: Joi.string().min(3).max(1024),
			businessAddress: Joi.string().min(3).max(1024),
			websiteAddress: Joi.string().domain().min(3).max(1024),
			isVendor: Joi.boolean()
		});
		return Schema.validate(account, { abortEarly: false });
	}

	static login(account) {
		const Schema = Joi.object({
			email: joiEmail.required(),
			password: Joi.string().required()
		});
		return Schema.validate(account, { convert: false, abortEarly: false });
	}

	static vendorReq(body) {
		const Schema = Joi.object({
			details: Joi.string()
		});
		return Schema.validate(body, { convert: false, abortEarly: false });
	}

	static token(query) {
		const Schema = Joi.object({
			token: Joi.string().required()
		});
		return Schema.validate(query, { convert: false, abortEarly: false });
	}

	static email(body) {
		const Schema = Joi.object({
			email: Joi.string().email().required()
		});
		return Schema.validate(body, { convert: false, abortEarly: false });
	}

	static accountType(account) {
		const Schema = Joi.object({
			type: joiAccountType.required()
		});
		return Schema.validate(account, { convert: false, abortEarly: false });
	}

	static userInfo(account) {
		const Schema = Joi.object({
			name: joiName,
			email: joiEmail,
			phoneNumber: joiPhoneNumber,
			birthday: JoiDate,
			gender: Joi.string().allow('male', 'female'),
			city: Joi.string().min(3).max(1024),
			address: Joi.string().min(3).max(1024),
			companyName: Joi.string().min(3).max(1024),
			businessAddress: Joi.string().min(3).max(1024),
			websiteAddress: Joi.string().domain().min(3).max(1024)
		});
		return Schema.validate(account, { abortEarly: false });
	}

	static password(account) {
		const Schema = Joi.object({
			oldPassword: Joi.string().required(),
			newPassword: passwordComplexity(complexityOptions, 'Password').required()
		});
		return Schema.validate(account, { convert: false, abortEarly: false });
	}

	static resetPassword(account) {
		const Schema = Joi.object({
			password: passwordComplexity(complexityOptions, 'Password').required(),
			code: Joi.string().required()
		});
		return Schema.validate(account, { convert: false, abortEarly: false });
	}

	static phoneNumber(account) {
		const Schema = Joi.object({
			phoneNumber: joiPhoneNumber.required()
		});
		return Schema.validate(account, { convert: false, abortEarly: false });
	}
}
