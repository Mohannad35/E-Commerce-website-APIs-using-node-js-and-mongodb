export default function (req, res, next) {
	res.set({ 'Access-Control-Expose-Headers': 'x-auth-token' });
	next();
}
