'use strict';

const
	HapiStatus = require('hapi-status'),
	Authorize = require(process.cwd() + '/lib/authorize'),
	pkg = require('./package.json'),
	base = '/api/' + pkg.version + '/quote',

	/* Mongoose */
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	VoteSchema = new Schema({
		email: String,
		vote: String
	}),
	QuoteSchema = new Schema({
		author: String,
		body: String,
		votes: [VoteSchema]
	});

QuoteSchema.statics.random = (email, callback) => {
	QuoteModel.count((error, count) => {
		if (error) {
			callback(error);
		}

		QuoteModel.findOne().skip(Math.floor(Math.random() * count)).exec((error, quote) => {
			if (error || !quote) {
				return callback(error || 'No Quotes Available');
			}

			if (quote.votes.filter((vote) => vote.email === email).length > 0) {
				return QuoteModel.random(email, callback);
			}

			callback(null, quote);
		});
	});
};

let QuoteModel = mongoose.model('Quote', QuoteSchema);

HapiStatus.addDelegation('applicationJson', (result) => result);

exports.register = (server, options, next) => {
	server.route({
		method: 'POST',
		path: base,
		handler: (request, reply) => {
			let author, body, model;

			if (!request.payload) {
				return HapiStatus.badRequest(reply);
			}

			author = request.payload.author;
			body = request.payload.body;

			if (!author || !body) {
				return HapiStatus.badRequest(reply);
			}

			model = new QuoteModel({author: author, body: body});

			model.save();

			return HapiStatus.noContent(reply);
		}
	});

	server.route({
		method: 'GET',
		path: base + '/random',
		handler: (request, reply) => {
			let token = request.query.token;

			Authorize.validate(token, (valid, tokenModel) => {
				if (!valid) {
					return HapiStatus.unauthorized(reply);
				}

				if (!tokenModel.current) {
					QuoteModel.random(tokenModel.email, (error, quote) => {
						if (error) {
							return HapiStatus.notFound(reply, error);
						}

						tokenModel.current = quote._id;
						tokenModel.save();

						return HapiStatus.ok(reply, {id: quote._id, author: quote.author, body: quote.body});
					});
				}
				else {
					QuoteModel.findOne(new mongoose.Types.ObjectId(tokenModel.current), (error, quote) => {
						if (error || !quote) {
							return HapiStatus.notFound(reply, error || 'No Quotes Available');
						}

						return HapiStatus.ok(reply, {id: quote._id, author: quote.author, body: quote.body});
					});
				}
			});
		}
	});

	server.route({
		method: 'POST',
		path: base + '/vote',
		handler: (request, reply) => {
			let token = request.payload.token,
				quoteId = request.payload.quote,
				vote = request.payload.vote;

			Authorize.validate(token, (valid, tokenModel) => {
				if (!valid || !quoteId || !vote || !mongoose.Types.ObjectId.isValid(quoteId)) {
					return HapiStatus.badRequest(reply);
				}

				tokenModel.current = null;
				tokenModel.save();

				QuoteModel.findOne(new mongoose.Types.ObjectId(quoteId), (error, quote) => {
					if (error) {
						return HapiStatus.notFound(reply, error);
					}

					if (quote.votes.filter((vote) => vote.email === tokenModel.email).length === 0) {
						quote.votes.push({email: tokenModel.email, vote: vote});
						quote.save();

						return HapiStatus.noContent(reply);
					}

					return HapiStatus.conflict(reply);
				});
			});
		}
	});

	next();
};

exports.register.attributes = {
	pkg: pkg
};
