'user strict';

var config = require('config'),
	DAOs = require('./daos'),
	UserDAO = DAOs[config.serverAppContext.userDAO],
	UserService = require('./user-service');

module.exports = UserService.create(UserDAO);