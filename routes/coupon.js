import { Router } from 'express';
import auth from '../middleware/auth.js';
import isVendor from '../middleware/vendor.js';
import validate from '../middleware/validateReq.js';
import Validator from '../middleware/validator.js';
import CouponController from '../controller/coupon.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = Router();

router.get('/', [auth, isVendor,  validate('query', Validator.getCoupons)], CouponController.coupons);

router.get('/:id', [validateObjectId], CouponController.coupon);

router.post(
	'/apply-coupon',
	[auth, validate('body', Validator.coupon)],
	CouponController.applyCoupon
);

router.post(
	'/cancel-coupon',
	[auth, validate('body', Validator.coupon)],
	CouponController.cancelCoupon
);

router.post(
	'/',
	[auth, isVendor, validate('body', Validator.addCoupon)],
	CouponController.addCoupon
);

router.patch(
	'/:id',
	[auth, isVendor, validateObjectId, validate('body', Validator.updateCoupon)],
	CouponController.updateCoupon
);

router.delete('/:id', [auth, isVendor, validateObjectId], CouponController.deleteCoupon);

export default router;
