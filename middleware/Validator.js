import Joi from 'joi';
import moment from 'moment';
import smn from 'joi-objectid';
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
const joiTitle = Joi.string()
	.min(2)
	.max(255)
	.pattern(/^\p{L}.*$/u)
	.message('title should start with a letter');
const joiId = Joi.objectId();
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
const joiDescription = Joi.string().min(3).max(1024);
const joiPrice = Joi.string()
	.pattern(/^[0-9.]+$/)
	.message('Price should be a positive number');
const joiQuantity = Joi.string()
	.pattern(/^[0-9]+$/)
	.message('Quantity should be a positive integer');
const joiImage = Joi.string().uri({ allowQuerySquareBrackets: true });

export default class Validator {
	// common
	static id(data) {
		const Schema = Joi.object({
			id: joiId.required()
		});
		return Schema.validate(data, { convert: false, abortEarly: false });
	}

	// user validation
	static getUsers(opts) {
		const Schema = Joi.object({
			pageNumber: Joi.string()
				.pattern(/^[0-9]+$/)
				.message('pageNumber should be a positive integer'),
			pageSize: Joi.string()
				.pattern(/^[0-9]+$/)
				.message('pageSize should be a positive integer'),
			skip: Joi.string()
				.pattern(/^[0-9]+$/)
				.message('skip should be a positive integer'),
			limit: Joi.string()
				.pattern(/^[0-9]+$/)
				.message('limit should be a positive integer'),
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

	// item validation
	static getItems(item) {
		const Schema = Joi.object({
			pageNumber: Joi.string()
				.allow('')
				.pattern(/^[0-9]+$/)
				.message('pageNumber should be a positive integer'),
			pageSize: Joi.string()
				.allow('')
				.pattern(/^[0-9]+$/)
				.message('pageSize should be a positive integer'),
			skip: Joi.string()
				.allow('')
				.pattern(/^[0-9]+$/)
				.message('skip should be a positive integer'),
			limit: Joi.string()
				.allow('')
				.pattern(/^[0-9]+$/)
				.message('limit should be a positive integer'),
			sort: Joi.string()
				.allow('')
				.pattern(/^[A-Za-z_\-,.]+$/)
				.message('sort should only contain letters and _-,.'),
			category: Joi.string().allow(''),
			owner: Joi.string().allow(''),
			brand: Joi.string().allow(''),
			from: Joi.string()
				.allow('')
				.pattern(/^[0-9]+$/)
				.message('from should be a positive integer'),
			to: Joi.string()
				.allow('')
				.pattern(/^[0-9]+$/)
				.message('to should be a positive integer'),
			name: Joi.string().allow('')
		});
		return Schema.validate(item, { convert: false, abortEarly: false });
	}

	static addItem(item) {
		const Schema = Joi.object({
			name: joiName.required(),
			description: joiDescription.required(),
			category: joiId.required(),
			price: joiPrice.required(),
			quantity: joiQuantity.required(),
			brand: joiId
		});
		return Schema.validate(item, { convert: false, abortEarly: false });
	}

	static updateItem(item) {
		const Schema = Joi.object({
			name: joiName,
			description: joiDescription,
			category: joiId,
			brand: joiId,
			price: joiPrice,
			quantity: joiQuantity,
			deleteImages: Joi.any(),
			images: Joi.any()
		});
		return Schema.validate(item, { convert: false, abortEarly: false });
	}

	// cart validation
	static cart(cart) {
		const Schema = Joi.object({
			quantity: joiQuantity.required()
		});
		return Schema.validate(cart, { convert: false, abortEarly: false });
	}

	static cartItems(items) {
		const Schema = Joi.object({
			items: Joi.array()
				.items(
					Joi.object({
						_id: Joi.objectId().required(),
						quantity: Joi.number().integer().positive().required()
					})
				)
				.required()
		});
		return Schema.validate(items, { convert: false, abortEarly: false });
	}

	static quantity(cart) {
		const Schema = Joi.object({
			quantity: joiQuantity
		});
		return Schema.validate(cart, { convert: false, abortEarly: false });
	}

	// order validation
	static order(order) {
		const Schema = Joi.object({
			paymentMethod: Joi.string().allow('cash', 'credit card'),
			contactPhone: joiPhoneNumber.required(),
			address: Joi.string().min(3).max(1024).required()
		});
		return Schema.validate(order, { convert: false, abortEarly: false });
	}

	// category validations
	static categories(categories) {
		const Schema = Joi.object({
			pageNumber: Joi.string()
				.pattern(/^[0-9]+$/)
				.message('pageNumber should be a positive integer'),
			pageSize: Joi.string()
				.pattern(/^[0-9]+$/)
				.message('pageSize should be a positive integer'),
			skip: Joi.string()
				.pattern(/^[0-9]+$/)
				.message('skip should be a positive integer'),
			limit: Joi.string()
				.pattern(/^[0-9]+$/)
				.message('limit should be a positive integer'),
			sort: Joi.string()
				.pattern(/^[A-Za-z_\-,.]+$/)
				.message('sort should only contain letters and _-,.'),
			main: Joi.string()
				.pattern(/^[A-Za-z_\-,.]+$/)
				.message('sort should only contain letters and _-,.'),
			title: joiTitle,
			parentId: joiId,
			isParent: Joi.string().allow('true', 'false'),
			slug: Joi.string(),
			catArr: Joi.string()
		});
		return Schema.validate(categories, { convert: false, abortEarly: false });
	}

	static addCategory(category) {
		const Schema = Joi.object({
			title: joiTitle.required(),
			parentId: joiId
		});
		return Schema.validate(category, { convert: false, abortEarly: false });
	}

	static updateCategory(category) {
		const Schema = Joi.object({
			title: joiTitle
		});
		return Schema.validate(category, { convert: false, abortEarly: false });
	}

	// brand validations
	static addBrand(brand) {
		const Schema = Joi.object({
			name: joiName.required()
		});
		return Schema.validate(brand, { convert: false, abortEarly: false });
	}

	static updateBrand(brand) {
		const Schema = Joi.object({
			name: joiName
		});
		return Schema.validate(brand, { convert: false, abortEarly: false });
	}

	// list validations
	static list(category) {
		const Schema = Joi.object({
			name: joiName.required(),
			listId: joiId,
			populate: Joi.string().allow('true', 'false', ''),
			page: Joi.string()
				.allow('')
				.pattern(/^[0-9]+$/)
				.message('page should be a positive integer'),
			pageSize: Joi.string()
				.allow('')
				.pattern(/^[0-9]+$/)
				.message('pageSize should be a positive integer')
		});
		return Schema.validate(category, { convert: false, abortEarly: false });
	}

	static listItemId(category) {
		const Schema = Joi.object({
			listId: joiId,
			id: joiId.required()
		});
		return Schema.validate(category, { convert: false, abortEarly: false });
	}

	// Rate validations
	static addRate(rate) {
		const Schema = Joi.object({
			itemId: joiId.required(),
			rateValue: Joi.number().min(0).max(5).required(),
			review: Joi.string()
		});
		return Schema.validate(rate, { convert: false, abortEarly: false });
	}

	static editRate(rate) {
		const Schema = Joi.object({
			rateValue: Joi.number().min(0).max(5),
			review: Joi.string()
		}).or('rateValue', 'review');
		return Schema.validate(rate, { convert: false, abortEarly: false });
	}

	static getRates(rate) {
		const Schema = Joi.object({
			pageNumber: Joi.string()
				.allow('')
				.pattern(/^[0-9]+$/)
				.message('pageNumber should be a positive integer'),
			pageSize: Joi.string()
				.allow('')
				.pattern(/^[0-9]+$/)
				.message('pageSize should be a positive integer'),
			skip: Joi.string()
				.allow('')
				.pattern(/^[0-9]+$/)
				.message('skip should be a positive integer'),
			limit: Joi.string()
				.allow('')
				.pattern(/^[0-9]+$/)
				.message('limit should be a positive integer'),
			sort: Joi.string()
				.allow('')
				.pattern(/^[A-Za-z_\-,.]+$/)
				.message('sort should only contain letters and _-,.'),
			itemId: joiId.allow(''),
			userId: joiId.allow('')
		});
		return Schema.validate(rate, { convert: false, abortEarly: false });
	}

	static getCoupons(coupon) {
		const Schema = Joi.object({
			pageNumber: Joi.string()
				.allow('')
				.pattern(/^[0-9]+$/)
				.message('pageNumber should be a positive integer'),
			pageSize: Joi.string()
				.allow('')
				.pattern(/^[0-9]+$/)
				.message('pageSize should be a positive integer'),
			skip: Joi.string()
				.allow('')
				.pattern(/^[0-9]+$/)
				.message('skip should be a positive integer'),
			limit: Joi.string()
				.allow('')
				.pattern(/^[0-9]+$/)
				.message('limit should be a positive integer'),
			sort: Joi.string()
				.allow('')
				.pattern(/^[A-Za-z_\-,.]+$/)
				.message('sort should only contain letters and _-,.'),
			code: Joi.string().allow(''),
			all: Joi.string().allow(''),
			working: Joi.string().allow(''),
			expireAt: Joi.string().allow(''),
			expireDay: Joi.string().allow('')
		});
		return Schema.validate(coupon, { convert: false, abortEarly: false });
	}

	static addCoupon(coupon) {
		const Schema = Joi.object({
			code: Joi.string().allow(''),
			discount: Joi.number().min(0).max(99).required(),
			expireAt: Joi.string().allow(''),
			validFrom: Joi.string().allow('')
		});
		return Schema.validate(coupon, { convert: false, abortEarly: false });
	}

	static updateCoupon(coupon) {
		const Schema = Joi.object({
			code: Joi.string().allow(''),
			discount: Joi.number().min(0).max(99).allow(''),
			expireAt: Joi.string().allow(''),
			validFrom: Joi.string().allow('')
		});
		return Schema.validate(coupon, { convert: false, abortEarly: false });
	}
}
