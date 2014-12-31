'use strict';

var path = require('path');

var log4jsConfig = 
{
	appenders: [
		{ 
			type: 'file',
			filename: 'server.log',
			layout : {
				type : 'pattern',
				pattern : '%d | %p | %c | %m'
			}
		},
		{
			type: 'console',
			layout: {
				type : 'pattern',
				pattern : '%[%d | %p | %c |%] %m'
			}
		}
	],
	replaceConsole : false,
}


module.exports = {

	serverAppContext: {
		server: {
			port: 9000,
			staticUrl: '/static',
			distFolder: path.join('..', 'client', 'dist'),
			livereload: false
		},
		
		log4js: {
			config: log4jsConfig,
			globalLogLevel: 'INFO'
		}
	}
};

// vim: set noexpandtab ts=2 sw=2 :
