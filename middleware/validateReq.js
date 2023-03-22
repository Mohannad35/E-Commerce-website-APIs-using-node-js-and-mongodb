const { unlink } = require('fs');
const logger = require('../middleware/logger.js');

module.exports = function (obj, validator) {
	return async (req, res, next) => {
		const { error } = validator(req[obj]);
		if (error) {
			const { file, files } = req;
			if (file) {
				await unlink(
					`${__dirname.replace(/middleware/, '')}${file.destination}/${file.filename}`,
					err => err && logger.error(err.message, err)
				);
			}
			if (files) {
				files.forEach(async file => {
					await unlink(
						`${__dirname.replace(/middleware/, '')}${file.destination}/${file.filename}`,
						err => err && logger.error(err.message, err)
					);
				});
			}
			let errorMessage = '';
			for (let err of error.details) errorMessage = errorMessage.concat(err.message, '. ');
			return res.status(400).send({ error: true, message: errorMessage.replace(/"/g, '') });
		}
		next();
	};
};
