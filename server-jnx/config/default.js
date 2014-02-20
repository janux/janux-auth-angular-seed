'use strict';

var path = require('path');

var log4jsConfig = 
{
	appenders: [
		{ 
			type: "file",
			filename: "server.log",
			layout : {
				type : "pattern",
				pattern : "%d | %p | %c | %m"
			}
		},
		{
			type: "console",
			layout: {
				type : "pattern",
				pattern : "%[%d | %p | %c |%] %m"
			}
		}
	],
	replaceConsole : false,
}


module.exports = {

	log4js: {
		config: log4jsConfig,
		globalLogLevel: 'INFO'
	},

	server: {
		port: 3000,
		staticUrl: '/static',
		distFolder: path.resolve(__dirname, '../../client/dist')
	}
// 
// 	service: {
// 		common: {
// 			// baseUrl: 'http://core2.jetsonsys.com:10080/rpc'
// 			baseUrl: 'http://core1.jetsonsys.com/api',
// 			auth: {
// 				user: 'admin',
// 				pass: 'gra33y'
// 			}
// 		},
// 		user: {
// 			impl: './lib/UserService',
// 			contextPath: '/userservice'
// 		},
// 		contact: {
// 			impl: './lib/ContactService',
// 			contextPath: '/contactservice'
// 		}
// 	}
};

// vim: set noexpandtab ts=2 sw=2 :
