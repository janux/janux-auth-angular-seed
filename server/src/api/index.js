'use strict';
var UserPersistence                      = require('janux-persist').UserService,
    PartyServiceImpl                     = require('janux-persist').PartyServiceImpl,
    AuthContextPersistence               = require('janux-persist').AuthContextService,
    AuthContextGroupService              = require('janux-persist').AuthContextGroupServiceImpl,
    RolePersistence                      = require('janux-persist').RoleService,
    GroupService                         = require('janux-persist').GroupServiceImpl,
    PartyGroupServiceImpl                = require('janux-persist').PartyGroupServiceImpl,
    OperationServiceImpl                 = require('glarus-services').OperationServiceImpl,
    ResourceServiceImpl                  = require('glarus-services').ResourceServiceImpl,
    TimeEntryServiceImpl                 = require('glarus-services').TimeEntryServiceImpl,
    TimeEntryReportServiceImpl           = require('glarus-services').TimeEntryReportService,
    TimeEntryReportGuardServiceImpl      = require('glarus-services').TimeEntryReportGuardService,
    TimeEntryReportAttendanceServiceImpl = require('glarus-services').TimeEntryReportAttendanceService,
    TimeEntryReportSpecialOpsServiceImpl = require('glarus-services').TimeEntryReportSpecialOpsService,
    VehicleServiceImpl                   = require('glarus-services').VehicleServiceImpl;

var config                           = require('config'),
    appContext                       = config.serverAppContext,
    DAOs                             = require('./daos'),
    AccountDao                       = DAOs[appContext.dao.accountDao],
    StaffDao                         = DAOs[appContext.dao.staffDao],
    PartyDao                         = DAOs[appContext.dao.partyDao],
    AuthContextDAO                   = DAOs[appContext.dao.authContextDao],
    RoleDAO                          = DAOs[appContext.dao.roleDao],
    GroupContentDao                  = DAOs[appContext.dao.groupContentDao],
    GroupDao                         = DAOs[appContext.dao.groupDao],
    GroupAttributeValueDao           = DAOs[appContext.dao.groupAttributeValueDao],
    PartyPersistenceService          = new PartyServiceImpl(PartyDao, StaffDao),

    // Begin glarus services DAOs.
    VehicleDao                       = DAOs[appContext.dao.vehicleDao],
    TimeEntryPrincipalDao            = DAOs[appContext.dao.timeEntryPrincipalDao],
    OperationDao                     = DAOs[appContext.dao.operationDao],
    OperationAttributeDao            = DAOs[appContext.dao.operationAttributeDao],
    OperationPrincipalDao            = DAOs[appContext.dao.operationPrincipalDao],
    TimeEntryDao                     = DAOs[appContext.dao.timeEntryDao],
    ResourceDao                      = DAOs[appContext.dao.resourceDao],
    CurrentResourceDao               = DAOs[appContext.dao.currentResourceDao],
    TimeEntryAttributeDao            = DAOs[appContext.dao.timeEntryAttributeDao],
    TimeEntryResourceDao             = DAOs[appContext.dao.timeEntryResourceDao],
    // End glarus services DAOs.

    // Begin glarus services implementations.
    ResourcePersistService           = new ResourceServiceImpl(ResourceDao, PartyPersistenceService, VehicleDao),
    TimeEntryPersistService          = new TimeEntryServiceImpl(OperationDao, TimeEntryDao, TimeEntryAttributeDao, TimeEntryPrincipalDao, TimeEntryResourceDao, ResourcePersistService, PartyPersistenceService, VehicleDao),
    OperationPersistService          = new OperationServiceImpl(OperationDao, TimeEntryPersistService, ResourcePersistService, PartyPersistenceService, VehicleDao, CurrentResourceDao, OperationPrincipalDao, OperationAttributeDao),
    TimeEntryReportService           = new TimeEntryReportServiceImpl(OperationPersistService, TimeEntryPersistService),
    TimeEntryReportGuardService      = new TimeEntryReportGuardServiceImpl(OperationPersistService, TimeEntryPersistService),
    TimeEntryReportAttendanceService = new TimeEntryReportAttendanceServiceImpl(OperationPersistService, TimeEntryPersistService),
    TimeEntryReportSpecialOpsService = new TimeEntryReportSpecialOpsServiceImpl(OperationPersistService, TimeEntryPersistService),
    VehiclePersistenceService        = new VehicleServiceImpl(VehicleDao),

    // End glarus services implementations.

    UserPersistenceService           = UserPersistence.createInstance(AccountDao, PartyPersistenceService),
    GroupPersistService              = new GroupService(GroupDao, GroupContentDao, GroupAttributeValueDao),
    PartyGroupPersistenceService     = new PartyGroupServiceImpl(PartyPersistenceService, GroupPersistService),
    AuthContextPersistService        = AuthContextPersistence.createInstance(AuthContextDAO),
    AuthContextGroupPersistService   = new AuthContextGroupService(AuthContextPersistService, GroupPersistService),
    RolePersistService               = RolePersistence.createInstance(RoleDAO),
    UserService                      = require('./user-service'),
    AuthContextService               = require('./auth-context-service'),
    RoleService                      = require('./role-service'),
    OperationService                 = require('./operation-service'),
    PartyService                     = require('./party-service'),
    TimeEntryService                 = require('./time-entry-service'),
    ResourceService                  = require('./resource-service'),
    PartyGroupService                = require('./party-group-service'),
    VehicleService                   = require('./vehicle-service');


module.exports = {
	UserService                     : UserService.create(UserPersistenceService),
	AuthContextService              : AuthContextService.create(AuthContextPersistService, AuthContextGroupPersistService),
	RoleService                     : RoleService.create(RolePersistService),
	UserPersistenceService          : UserPersistenceService,
	PartyService                    : PartyService.create(PartyPersistenceService),
	OperationService                : OperationService.create(OperationPersistService),
	TimeEntryService                : TimeEntryService.create(TimeEntryPersistService),
	ResourceService                 : ResourceService.create(ResourcePersistService),
	TimeEntryReportService          : TimeEntryReportService,
	TimeEntryReportGuardService     : TimeEntryReportGuardService,
	TimeEntryReportAttendanceService: TimeEntryReportAttendanceService,
	TimeEntryReportSpecialOpsService: TimeEntryReportSpecialOpsService,
	PartyGroupService               : PartyGroupService.create(PartyGroupPersistenceService),
	VehicleService                  : VehicleService.create(VehiclePersistenceService)
};