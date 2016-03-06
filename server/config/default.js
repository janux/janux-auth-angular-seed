'use strict';

var path = require('path');

module.exports = {

	serverAppContext: {
		server: {
			port: 9000,
			staticUrl: '/static',
			distFolder: path.join('..', 'client', 'dist'),
			livereload: false
		},
		
		log4js: {
			config: require('./log4js.js'),
			globalLogLevel: 'INFO'
		}
	}
};
