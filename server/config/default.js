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
		//Daos to be used by the services.
		accountDao: 'accountDao',
		partyDao: 'partyDao',
		authContextDao: 'authContextDao',
		roleDao: 'roleDao',
		groupContentDao: 'groupContentDao',
		groupDao: 'groupDao',
		groupAttributeValueDao: 'groupAttributeValueDao',
		// Glarus services daos.
		vehicleDao: 'vehicleDao',
		timeEntryPrincipalDao: 'timeEntryPrincipalDao',
		operationDao: 'operationDao',
		operationPrincipalDao: 'operationPrincipalDao',
		timeEntryDao: 'timeEntryDao',
		resourceDao: 'resourceDao',
		currentResourceDao: 'currentResourceDao',
		timeEntryAttributeDao: 'timeEntryAttributeDao',
		timeEntryResourceDao: 'timeEntryResourceDao',
		// End glarus services daos.

		log4js: {
			config: require('./log4js.js'),
			globalLogLevel: 'INFO'
		},

		// janux-persistence settings
		db: {
			//Default db engine to use for user generator.
			//Because this setting is not used for the daos. Just make use
			//the db you are going to use for user generation is the same
			//for the daos.
			dbEngine: "mongoose",
			//If mongodb is chosen for user generation and daos, you must define the connection url.
			mongoConnUrl: "mongodb://localhost/opsGlarus",
			//If lokijs is defined for user generation and daos, you must define the path of the file database.
			lokiJsDBPath: "../server/janux-people.db"
		}
	}
};
