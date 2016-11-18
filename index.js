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
					console.error('Failed to load plugin: ', path);
				}
			});
		}
	});

server.register(require('inert'), (error) => {
	Hoek.assert(!error, error);
});

server.register(require('vision'), (error) => {
	Hoek.assert(!error, error);

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

server.start((error) => {
	if (error) {
		throw error;
	}

	console.log('Started: ', Config.get('manifest/connection/port'));
});

module.exports = server;
