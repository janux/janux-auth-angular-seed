'use strict';

var config            = require('config').serverAppContext,
	DataSourceHandler = require('janux-persist').DataSourceHandler,
	DaoFactory        = require('janux-persist').DaoFactory;

// When creating a dao also creates a db connection to the database.
// In case you want the program do not open unnecessary connections, comment the daos
// you don't need and make sure the commented daos are not referenced in the config settings.
module.exports = {
	accountDaoLokijs: DaoFactory.createAccountDao(DataSourceHandler.LOKIJS, config.db.lokiJsDBPath),
	partyDaoLokijs: DaoFactory.createPartyDao(DataSourceHandler.LOKIJS, config.db.lokiJsDBPath),
	accountDaoMongo: DaoFactory.createAccountDao(DataSourceHandler.MONGOOSE, config.db.mongoConnUrl),
	partyDaoMongo: DaoFactory.createPartyDao(DataSourceHandler.MONGOOSE, config.db.mongoConnUrl),
	authDAO: require('./authorization-dao').object()
};