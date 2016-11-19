'use strict';

const
	fs = require('fs'),
	nodemailer = require('nodemailer'),
	Config = require('peafowl'),
	user = Config.get('mail/user'),
	password = Config.get('mail/password'),
	host = Config.get('mail/host'),
	transporter = nodemailer.createTransport('smtps://' + user + ':' + password + '@' + host);

let options = {
	from: '"Questionable Quotes" <' + user + '>',
	subject: 'Invitation'
};

module.exports = {
	send: (to, nonce, callback) => {
		options.to = to;
		options.html = options.text = fs.readFileSync(process.cwd() + '/public/html/mail.html', 'utf8').replace(/\{nonce\}/g, nonce);

		transporter.sendMail(options, callback);
	}
};
