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

		accountDao: 'accountDaoLokijs',
		partyDao: 'partyDaoLokijs',
		authDAO: 'authDAO',

		log4js: {
			config: require('./log4js.js'),
			globalLogLevel: 'INFO'
		},

		// janux-persistence settings
		db: {
			//Default db engine to use for user generator.
			dbEngine: "lokijs",
			//If mongodb is chosen. You must define the connection url.
			mongoConnUrl: "mongodb://localhost/janux-persistence-dev",
			//If lokijs is defined you must define the path of the file database.
			lokiJsDBPath: "../server/janux-people.db"
		}
	}
};
