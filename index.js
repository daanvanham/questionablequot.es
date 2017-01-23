'use strict';

const
	Hapi = require('hapi'),
	Hoek = require('hoek'),
	fs = require('fs'),
	server = new Hapi.Server(),
	Config = require('peafowl'),
	mongoose = require('mongoose');

mongoose.connect(Config.get('database/dsn'));
server.connection(Config.get('manifest/connection'));

fs.readdirSync('./api')
	.forEach((item) => {
		let path = './api/' + item;

		if (fs.statSync(path).isDirectory()) {
			server.register(require(path), (error) => {
				if (error) {
					return server.log(['error'], 'Failed to load plugin: ', path);
				}
			});
		}
	});

let options = {
		reporters: {}
	},
	reporters = {
		access: [{response: '*'}],
		error: [{log: 'error'}, {error: '*'}],
		info: [{log: '*'}]
	};

Object.keys(reporters)
	.forEach((type) => {
		options.reporters[type] = [
			{module: 'good-squeeze', name: 'Squeeze', args: reporters[type]},
			{module: 'good-squeeze', name: 'SafeJson'},
			{module: 'rotating-file-stream', args: [type + '.log', {size: '10MB', path: './logs'}]}
		];
	});

server.register(require('inert'), (error) => {
	if (error) {
		return server.log(['error'], error);
	}
});

server.register(require('vision'), (error) => {
	if (error) {
		return server.log(['error'], error);
	}

	server.views({
		engines: {
			html: require('handlebars')
		},
		relativeTo: __dirname,
		path: './public/html',
		layout: true,
		layoutPath: './public/html/layout'
	});
});

server.register({
		register: require('good'),
		options,
	}, (error) => {
		if (error) {
			return server.log(['error'], error);
		}

		server.start(() => {
			return server.log(['info'], 'server started: ', Config.get('manifest/connection/port'));
		});
	});

module.exports = server;
