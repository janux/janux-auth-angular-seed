'use strict';
var UserPersistence         = require('janux-persist').UserService,
	PartyServiceImpl        = require('janux-persist').PartyServiceImpl,
	AuthContextPersistence  = require('janux-persist').AuthContextService,
	AuthContextGroupService = require('janux-persist').AuthContextGroupServiceImpl,
	RolePersistence         = require('janux-persist').RoleService,
	GroupService            = require('janux-persist').GroupServiceImpl,
	OperationServiceImpl    = require('glarus-services').OperationServiceImpl,
	ResourceServiceImpl     = require('glarus-services').ResourceServiceImpl,
	TimeEntryServiceImpl    = require('glarus-services').TimeEntryServiceImpl;

var config                         = require('config'),
	appContext                     = config.serverAppContext,
	DAOs                           = require('./daos'),
	AccountDao                     = DAOs[appContext.accountDao],
	PartyDao                       = DAOs[appContext.partyDao],
	AuthContextDAO                 = DAOs[appContext.authContextDao],
	RoleDAO                        = DAOs[appContext.roleDao],
	GroupContentDao                = DAOs[appContext.groupContentDao],
	GroupDao                       = DAOs[appContext.groupDao],
	GroupAttributeValueDao         = DAOs[appContext.groupAttributeValueDao],
	PartyPersistenceService        = new PartyServiceImpl(PartyDao),
	// Begin glarus services DAOs.
	VehicleDao                     = DAOs[appContext.vehicleDao],
	TimeEntryPrincipalDao          = DAOs[appContext.timeEntryPrincipalDao],
	OperationDao                   = DAOs[appContext.operationDao],
	TimeEntryDao                   = DAOs[appContext.timeEntryDao],
	ResourceDao                    = DAOs[appContext.resourceDao],
	CurrentResourceDao             = DAOs[appContext.currentResourceDao],
	TimeEntryAttributeDao          = DAOs[appContext.timeEntryAttributeDao],
	TimeEntryResourceDao           = DAOs[appContext.timeEntryResourceDao],

	// End glarus services DAOs.

	// Begin glarus services implementations.
	ResourcePersistService         = new ResourceServiceImpl(ResourceDao, PartyPersistenceService, VehicleDao),
	TimeEntryPersistService        = new TimeEntryServiceImpl(OperationDao, TimeEntryDao, TimeEntryAttributeDao, TimeEntryPrincipalDao, TimeEntryResourceDao, ResourcePersistService, PartyPersistenceService, VehicleDao),
	OperationPersistService        = new OperationServiceImpl(OperationDao, TimeEntryPersistService, ResourcePersistService, PartyPersistenceService, VehicleDao, CurrentResourceDao),

	// End glarus services implementations.

	UserPersistenceService         = UserPersistence.createInstance(AccountDao, PartyPersistenceService),
	GroupPersistService            = new GroupService(GroupDao, GroupContentDao, GroupAttributeValueDao),
	AuthContextPersistService      = AuthContextPersistence.createInstance(AuthContextDAO),
	AuthContextGroupPersistService = new AuthContextGroupService(AuthContextPersistService, GroupPersistService),
	RolePersistService             = RolePersistence.createInstance(RoleDAO),
	UserService                    = require('./user-service'),
	AuthContextService             = require('./auth-context-service'),
	RoleService                    = require('./role-service'),
	OperationService               = require('./operation-service'),
	PartyService                   = require('./party-service'),
	TimeEntryService               = require('./time-entry-service'),
	ResourceService                = require('./resource-service');


module.exports = {
	UserService           : UserService.create(UserPersistenceService),
	AuthContextService    : AuthContextService.create(AuthContextPersistService, AuthContextGroupPersistService),
	RoleService           : RoleService.create(RolePersistService),
	UserPersistenceService: UserPersistenceService,
	PartyService          : PartyService.create(PartyPersistenceService),
	OperationService      : OperationService.create(OperationPersistService),
	TimeEntryService      : TimeEntryService.create(TimeEntryPersistService),
	ResourceService       : ResourceService.create(ResourcePersistService)
};