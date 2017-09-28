'user strict';
var UserPersistence = require('janux-persist').UserService,
	AuthContextPersistence = require('janux-persist').AuthContextService,
	AuthContextGroupService = require('janux-persist').AuthContextGroupServiceImpl,
	RolePersistence = require('janux-persist').RoleService,
	GroupService = require('janux-persist').GroupServiceImpl;

var config                 = require('config'),
	appContext			   = config.serverAppContext,
	DAOs                   = require('./daos'),
	AccountDao             = DAOs[appContext.accountDao],
	PartyDao               = DAOs[appContext.partyDao],
	AuthContextDAO         = DAOs[appContext.authContextDao],
	RoleDAO                = DAOs[appContext.roleDao],
 	GroupContentDao 	   = DAOs[appContext.groupContentDao],
	GroupDao 			   = DAOs[appContext.groupDao],
	GroupAttributeValueDao = DAOs[appContext.groupAttributeValueDao],
	UserPersistenceService = UserPersistence.createInstance(AccountDao, PartyDao),
	GroupPersistService = new GroupService(GroupDao, GroupContentDao, GroupAttributeValueDao);
	AuthContextPersistService = AuthContextPersistence.createInstance(AuthContextDAO),
	AuthContextGroupPersistService = new AuthContextGroupService(AuthContextPersistService,GroupPersistService),
	RolePersistService 	   = RolePersistence.createInstance(RoleDAO),
	UserService            = require('./user-service'),
	AuthService            = require('./authorization-service');

module.exports = {
	UserService: UserService.create(UserPersistenceService),
	AuthService: AuthService.create(AuthContextPersistService,AuthContextGroupPersistService, RolePersistService),
	UserPersistenceService: UserPersistenceService
};