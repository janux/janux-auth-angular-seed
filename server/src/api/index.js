'user strict';
var UserPersistence = require('janux-persist').UserService;

var config                 = require('config'),
	DAOs                   = require('./daos'),
	AccountDao             = DAOs[config.serverAppContext.accountDao],
	PartyDao               = DAOs[config.serverAppContext.partyDao],
	UserPersistenceService = UserPersistence.createInstance(AccountDao, PartyDao),
	AuthDAO                = DAOs[config.serverAppContext.authDAO],
	UserService            = require('./user-service'),
	AuthService            = require('./authorization-service');

module.exports = {
	UserService: UserService.create(UserPersistenceService),
	AuthService: AuthService.create(AuthDAO),
	UserPersistenceService: UserPersistenceService
};