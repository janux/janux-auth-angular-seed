'user strict';
var UserPersistence = require('janux-persist').UserService,
	AuthContextPersistence = require('janux-persist').AuthContextService,
	RolePersistence = require('janux-persist').RoleService;

var config                 = require('config'),
	DAOs                   = require('./daos'),
	AccountDao             = DAOs[config.serverAppContext.accountDao],
	PartyDao               = DAOs[config.serverAppContext.partyDao],
	UserPersistenceService = UserPersistence.createInstance(AccountDao, PartyDao),
	AuthContextDAO         = DAOs[config.serverAppContext.authContextDao],
	RoleDAO                = DAOs[config.serverAppContext.roleDao],
	AuthContextPersistService = AuthContextPersistence.createInstance(AuthContextDAO),
	RolePersistService 	   = RolePersistence.createInstance(RoleDAO),
	UserService            = require('./user-service'),
	AuthService            = require('./authorization-service');

module.exports = {
	UserService: UserService.create(UserPersistenceService),
	AuthService: AuthService.create(AuthContextPersistService, RolePersistService),
	UserPersistenceService: UserPersistenceService
};