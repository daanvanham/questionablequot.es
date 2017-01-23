'use strict';

const
	HapiStatus = require('hapi-status'),
	Config = require('peafowl'),
	Mail = require(process.cwd() + '/lib/mail'),
	pkg = require('./package.json'),
	base = '/api/' + pkg.version + '/authorize',
	validator = Config.get('mail/validator'),

	/* Mongoose */
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	TokenSchema = new Schema({
		email: String,
		current: String,
		active: {
			type: Boolean,
			default: false
		}
	});

let TokenModel = mongoose.model('Token', TokenSchema),
	Authorize = require(process.cwd() + '/lib/authorize');

HapiStatus.addDelegation('applicationJson', (result) => result);

exports.register = (server, options, next) => {
	server.route({
		method: 'POST',
		path: base + '/invite',
		handler: (request, reply) => {
			let email = request.payload.email;

			if (!new RegExp(validator).test(email)) {
				return HapiStatus.badRequest(reply, 'Invalid email address');
			}

			TokenModel.find({email: email}).remove().exec();

			let model = new TokenModel({
				email: email
			});

			model.save((error) => {
				if (error) {
					return server.log(['error'], error);
				}

				Mail.send(email, model._id, () => {
					return HapiStatus.ok(reply);
				});
			});

			return ;
		}
	});

	server.route({
		method: 'POST',
		path: base + '/activate',
		handler: (request, reply) => {
			let nonce = request.payload.nonce;

			Authorize.validate(nonce, (valid, token) => {
				if (!token) {
					return HapiStatus.badRequest(reply, 'Invalid nonce');
				}

				if (token && token.active) {
					return HapiStatus.badRequest(reply, 'Nonce already used');
				}

				token.active = true;
				token.save((error) => {
					if (error) {
						return server.log(['error'], error);
					}

					return HapiStatus.ok(reply);
				});
			});
		}
	});

	next();
};

exports.register.attributes = {
	pkg: pkg
};
