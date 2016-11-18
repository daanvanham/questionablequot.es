'use strict';

const
	mongoose = require('mongoose'),
	TokenModel = mongoose.model('Token');

function validate(token, callback) {
	if (!mongoose.Types.ObjectId.isValid(token)) {
		return callback(false);
	}

	TokenModel.findOne(new mongoose.Types.ObjectId(token), (error, token) => {
		if (error || !token || !token.active) {
			return callback(false, token);
		}

		return callback(true, token);
	});
}

module.exports = {
	validate: validate
};
