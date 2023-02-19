const mongoose = require('mongoose');

module.exports = function (req, res, next) {
	if (!mongoose.Types.ObjectId.isValid(req.params.id))
		return res.status(400).send({ error: true, message: 'Invalid ID.' });
	next();
};
