'use strict';

var config            = require('config').serverAppContext,
	promise           = require('bluebird'),
	DataSourceHandler = require('janux-persistence').DataSourceHandler,
	DaoFactory        = require('janux-persistence').DaoFactory;

 module.exports = {
 	accountDaoLokijs: require('janux-persistence').DaoFactory.createAccountDao(DataSourceHandler.LOKIJS, config.db.lokiJsDBPath),
 	partyDaoLokijs: require('janux-persistence').DaoFactory.createPartyDao(DataSourceHandler.LOKIJS, config.db.lokiJsDBPath),
 	accountDaoMongo: require('janux-persistence').DaoFactory.createAccountDao(DataSourceHandler.MONGODB, config.db.mongoConnUrl),
 	partyDaoMongo: require('janux-persistence').DaoFactory.createPartyDao(DataSourceHandler.MONGODB, config.db.mongoConnUrl),
 	authDAO: require('./authorization-dao').object()
 };