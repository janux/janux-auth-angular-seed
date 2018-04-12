'use strict';
var UserPersistence         = require('janux-persist').UserService,
	PartyServiceImpl        = require('janux-persist').PartyServiceImpl,
	AuthContextPersistence  = require('janux-persist').AuthContextService,
	AuthContextGroupService = require('janux-persist').AuthContextGroupServiceImpl,
	RolePersistence         = require('janux-persist').RoleService,
	GroupService            = require('janux-persist').GroupServiceImpl,
	PartyGroupServiceImpl   = require('janux-persist').PartyGroupServiceImpl;

var config                         = require('config'),
	appContext                     = config.serverAppContext,
	DAOs                           = require('./daos'),
	AccountDao                     = DAOs[appContext.dao.accountDao],
	StaffDao                       = DAOs[appContext.dao.staffDao],
	PartyDao                       = DAOs[appContext.dao.partyDao],
	AuthContextDAO                 = DAOs[appContext.dao.authContextDao],
	RoleDAO                        = DAOs[appContext.dao.roleDao],
	GroupContentDao                = DAOs[appContext.dao.groupContentDao],
	GroupDao                       = DAOs[appContext.dao.groupDao],
	GroupAttributeValueDao         = DAOs[appContext.dao.groupAttributeValueDao],
	UserPersistenceService         = UserPersistence.createInstance(AccountDao, PartyDao),
	PartyPersistenceService        = new PartyServiceImpl(PartyDao, StaffDao),
	GroupPersistService            = new GroupService(GroupDao, GroupContentDao, GroupAttributeValueDao),
	PartyGroupPersistenceService   = new PartyGroupServiceImpl(PartyPersistenceService, GroupPersistService),
	AuthContextPersistService      = AuthContextPersistence.createInstance(AuthContextDAO),
	AuthContextGroupPersistService = new AuthContextGroupService(AuthContextPersistService, GroupPersistService),
	RolePersistService             = RolePersistence.createInstance(RoleDAO),
	UserService                    = require('./user-service'),
	AuthContextService             = require('./auth-context-service'),
	RoleService                    = require('./role-service'),
	PartyService                   = require('./party-service'),
	PartyGroupService              = require('./party-group-service');

module.exports = {
	UserService           : UserService.create(UserPersistenceService),
	AuthContextService    : AuthContextService.create(AuthContextPersistService, AuthContextGroupPersistService),
	RoleService           : RoleService.create(RolePersistService),
	UserPersistenceService: UserPersistenceService,
	PartyService          : PartyService.create(PartyPersistenceService),
	PartyGroupService     : PartyGroupService.create(PartyGroupPersistenceService)
};