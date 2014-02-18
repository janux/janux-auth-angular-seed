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

  mongo: {
    dbUrl: 'https://api.mongolab.com/api/1',            // The base url of the MongoLab DB server
    apiKey: '4fb51e55e4b02e56a67b0b66'                  // Our MongoLab API key
  },
  security: {
    dbName: 'ascrum',                                   // The name of database that contains the security information
    usersCollection: 'users'                            // The name of the collection contains user information
  },
  server: {
    listenPort: 3000,                                   // The port on which the server is to listen (means that the app is at http://localhost:3000 for instance)
    securePort: 8433,                                   // The HTTPS port on which the server is to listen (means that the app is at https://localhost:8433 for instance)
    distFolder: path.resolve(__dirname, '../../client/dist'), // The folder that contains the application files (note that the files are in a different repository) - relative to this file
    staticUrl: '/static',                               // The base url from which we serve static files (such as js, css and images)
    cookieSecret: 'angular-app'                         // The secret for encrypting the cookie
  }
};

// vim: set noexpandtab ts=2 sw=2 :
