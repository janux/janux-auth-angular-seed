/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 9/24/17.
 */

'use strict';

module.exports = {
	serverAppContext: {
		server: {
			port: "SERVER_PORT"
		},
		// janux-persistence settings
		db: {
			//Default db engine to use for user generator.
			//Because this setting is not used for the daos. Just make use
			//the db you are going to use for user generation is the same
			//for the daos.
			dbEngine: "DB_ENGINE",
			//If mongodb is chosen for user generation and daos, you must define the connection url.
			mongoConnUrl: "MONGO_URL",
			//If lokijs is defined for user generation and daos, you must define the path of the file database.
			//Example ../server/janux-people2.db
			lokiJsDBPath: "LOKI_DB"
		}
	}
};
