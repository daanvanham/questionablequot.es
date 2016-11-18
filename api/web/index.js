'use strict';

const HapiStatus = require('hapi-status');

exports.register = (server, options, next) => {
	server.route({
		method: 'GET',
		path: '/',
		handler: (request, reply) => {
			return reply.view('index');
		}
	});

	server.route({
		method: 'GET',
		path: '/activate',
		handler: (request, reply) => {
			return reply.view('activate');
		}
	});

	server.route({
		method: 'GET',
		path: '/assets/{name}.js',
		handler: (request, reply) => {
			if (['api', 'base', 'activate'].indexOf(request.params.name) !== -1) {
				return reply.file('./public/js/' + request.params.name + '.js');
			}

			return HapiStatus.notFound(reply);
		}
	});

	server.route({
		method: 'GET',
		path: '/assets/base.css',
		handler: (request, reply) => {
			return reply.file('./public/css/base.css');
		}
	});

	server.route({
		method: 'GET',
		path: '/assets/logo.png',
		handler: (request, reply) => {
			return reply.file('./public/media/logo.png');
		}
	});

	server.route({
		method: 'GET',
		path: '/assets/font/nickname.woff',
		handler: (request, reply) => {
			return reply.file('./public/media/font/nickname.woff');
		}
	});

	server.route({
		method: 'GET',
		path: '/assets/font/nickname.woff2',
		handler: (request, reply) => {
			return reply.file('./public/media/font/nickname.woff2');
		}
	});

	next();
};

exports.register.attributes = {
	pkg: require('./package.json')
};
