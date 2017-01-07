'use strict';

var path = require('path');

module.exports = {

	serverAppContext: {
		server: {
			port: 9000,
			staticUrl: '',
			distFolder: path.join('..', 'client', 'dist'),
			livereload: false
		},

		mongoString: 'mongodb://authseed:b1gM0n3y@localhost/authseed',
		userDAO: 'userDAOLoki',
		authDAO: 'authDAO',

		log4js: {
			config: require('./log4js.js'),
			globalLogLevel: 'INFO'
		}
	}
};
