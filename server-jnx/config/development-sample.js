'use strict';

var log4jsConfig = 
{
	appenders: [
		{ 
			type: 'file',
			filename: 'server.log',
			// level: 'TRACE',
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
	replaceConsole : true
	,levels: {
		'AppContext': 'TRACE',
		'Server':     'DEBUG'
	}
	/*
	,levels: {
		'AppContext': 'INFO'
		'Server':     'INFO'
	}
	*/
}


module.exports = {

	log4js: {
		config: log4jsConfig,
		globalLogLevel: 'TRACE'
	},

	/*
	server: {
		port: 3001
	}
	*/
};
