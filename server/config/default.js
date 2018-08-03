'use strict';

var path = require('path');

module.exports = {

	serverAppContext: {
		server: {
			port      : 9000,
			staticUrl : '',
			distFolder: path.join('..', 'client', 'dist'),
			livereload: false,
			secret    : 'jules cyril value 238947 239800 239048 2309483 '
		},

		dao: {
			//Daos to be used by the services.
			accountDao            : 'accountDao',
			partyDao              : 'partyDao',
			authContextDao        : 'authContextDao',
			roleDao               : 'roleDao',
			groupContentDao       : 'groupContentDao',
			groupDao              : 'groupDao',
			groupAttributeValueDao: 'groupAttributeValueDao',
			staffDao              : 'staffDao',
			// Glarus services daos.
			vehicleDao            : 'vehicleDao',
			timeEntryPrincipalDao : 'timeEntryPrincipalDao',
			operationDao          : 'operationDao',
			operationAttributeDao : 'operationAttributeDao',
			operationPrincipalDao : 'operationPrincipalDao',
			timeEntryDao          : 'timeEntryDao',
			resourceDao           : 'resourceDao',
			currentResourceDao    : 'currentResourceDao',
			timeEntryAttributeDao : 'timeEntryAttributeDao',
			timeEntryResourceDao  : 'timeEntryResourceDao',
			taskTypeDao           : 'taskTypeDao',
			rateDao               : 'rateDao',
			rateMatrixDao         : 'rateMatrixDao',
			invoiceDao            : 'invoiceDao',
			invoiceItemDao        : 'invoiceItemDao',
			expenseDao            : 'expenseDao',
			invoiceItemTE         : 'invoiceItemTE'
			// End glarus services daos.
		},

		log4js: {
			config        : require('./log4js.js'),
			globalLogLevel: 'INFO'
		},

		// janux-persistence settings
		db: {
			//Default db engine to use for user generator.
			//Because this setting is not used for the daos. Just make use
			//the db you are going to use for user geeration is the same
			//for the daos.
			dbEngine    : "mongoose",
			//If mongodb is chosen for user generation and daos, you must define the connection url.
			mongoConnUrl: "mongodb://localhost/opsGlarus",
			//If lokijs is defined for user generation and daos, you must define the path of the file database.
			lokiJsDBPath: "../server/janux-people.db"
		}
	}
};
