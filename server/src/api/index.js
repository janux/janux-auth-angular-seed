'user strict';

var config = require('config'),
	DAOs = require('./daos'),
	UserDAO = DAOs[config.serverAppContext.userDAO],
	AuthDAO = DAOs[config.serverAppContext.authDAO],
	UserService = require('./user-service'),
	AuthService = require('./authorization-service');

module.exports = {
	UserService: UserService.create(UserDAO),
	AuthService: AuthService.create(AuthDAO)
};