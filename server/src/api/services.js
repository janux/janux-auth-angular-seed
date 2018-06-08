'use strict';
var UserPersistence                      = require('janux-persist').UserService,
    PartyServiceImpl                     = require('janux-persist').PartyServiceImpl,
    AuthContextPersistence               = require('janux-persist').AuthContextService,
    AuthContextGroupService              = require('janux-persist').AuthContextGroupServiceImpl,
    RolePersistence                      = require('janux-persist').RoleService,
    GroupService                         = require('janux-persist').GroupServiceImpl,
    PartyGroupServiceImpl                = require('janux-persist').PartyGroupServiceImpl,
    ResellerServiceImpl                  = require('janux-persist').ResellerServiceImpl,
    OperationServiceImpl                 = require('glarus-services').OperationServiceImpl,
    ResourceServiceImpl                  = require('glarus-services').ResourceServiceImpl,
    TimeEntryServiceImpl                 = require('glarus-services').TimeEntryServiceImpl,
    TimeEntryReportServiceImpl           = require('glarus-services').TimeEntryReportService,
    TimeEntryReportGuardServiceImpl      = require('glarus-services').TimeEntryReportGuardService,
    TimeEntryReportAttendanceServiceImpl = require('glarus-services').TimeEntryReportAttendanceService,
    TimeEntryReportSpecialOpsServiceImpl = require('glarus-services').TimeEntryReportSpecialOpsService,
    VehicleServiceImpl                   = require('glarus-services').VehicleServiceImpl,
    GlarusUserPersistence                = require('glarus-services').UserServiceImpl,
    UserOperationServiceImpl             = require('glarus-services').UserOperationService,
    TaskTypeServiceImpl                  = require('glarus-services').TaskTypeServiceImpl,
    RateMatrixServiceImpl                = require('glarus-services').RateMatrixServiceImpl;

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
    TaskTypeDao                      = DAOs[appContext.dao.taskTypeDao],
    RateDao                          = DAOs[appContext.dao.rateDao],
    RateMatrixDao                    = DAOs[appContext.dao.rateMatrixDao],
    // End glarus services DAOs.

    // Begin glarus services implementations.
    ResourcePersistService           = new ResourceServiceImpl(ResourceDao, PartyPersistenceService, VehicleDao, CurrentResourceDao, TimeEntryResourceDao),
    TimeEntryPersistService          = new TimeEntryServiceImpl(OperationDao, TimeEntryDao, TimeEntryAttributeDao, TimeEntryPrincipalDao, TimeEntryResourceDao, ResourcePersistService, PartyPersistenceService, VehicleDao),
    OperationPersistService          = new OperationServiceImpl(OperationDao, TimeEntryPersistService, ResourcePersistService, PartyPersistenceService, VehicleDao, CurrentResourceDao, OperationPrincipalDao, OperationAttributeDao),
    TimeEntryReportService           = new TimeEntryReportServiceImpl(OperationPersistService, TimeEntryPersistService),
    TimeEntryReportGuardService      = new TimeEntryReportGuardServiceImpl(OperationPersistService, TimeEntryPersistService),
    TimeEntryReportAttendanceService = new TimeEntryReportAttendanceServiceImpl(OperationPersistService, TimeEntryPersistService),
    TimeEntryReportSpecialOpsService = new TimeEntryReportSpecialOpsServiceImpl(OperationPersistService, TimeEntryPersistService),
    VehiclePersistenceService        = new VehicleServiceImpl(VehicleDao),
    TaskTypeService                  = new TaskTypeServiceImpl(TaskTypeDao),
    RateMatrixService                = new RateMatrixServiceImpl(PartyPersistenceService, RateMatrixDao, RateDao, TaskTypeDao,TaskTypeService),

    // End glarus services implementations.

    GroupPersistService              = new GroupService(GroupDao, GroupContentDao, GroupAttributeValueDao),
    PartyGroupPersistenceService     = new PartyGroupServiceImpl(PartyPersistenceService, GroupPersistService),
    UserPersistenceService           = UserPersistence.createInstance(AccountDao, PartyPersistenceService),
    GlarusUserPersistenceService     = new GlarusUserPersistence(UserPersistenceService, PartyGroupPersistenceService, PartyPersistenceService),
    ResellerPersistenceService       = new ResellerServiceImpl(PartyGroupPersistenceService),
    AuthContextPersistService        = AuthContextPersistence.createInstance(AuthContextDAO),
    AuthContextGroupPersistService   = new AuthContextGroupService(AuthContextPersistService, GroupPersistService),
    RolePersistService               = RolePersistence.createInstance(RoleDAO),
    UserOperationService             = new UserOperationServiceImpl(GlarusUserPersistenceService, OperationPersistService);

module.exports = {
	PartyPersistenceService         : PartyPersistenceService,
	ResourcePersistService          : ResourcePersistService,
	TimeEntryPersistService         : TimeEntryPersistService,
	OperationPersistService         : OperationPersistService,
	TimeEntryReportService          : TimeEntryReportService,
	TimeEntryReportGuardService     : TimeEntryReportGuardService,
	TimeEntryReportAttendanceService: TimeEntryReportAttendanceService,
	TimeEntryReportSpecialOpsService: TimeEntryReportSpecialOpsService,
	VehiclePersistenceService       : VehiclePersistenceService,
	UserPersistenceService          : UserPersistenceService,
	GroupPersistService             : GroupPersistService,
	PartyGroupPersistenceService    : PartyGroupPersistenceService,
	ResellerPersistenceService      : ResellerPersistenceService,
	AuthContextPersistService       : AuthContextPersistService,
	AuthContextGroupPersistService  : AuthContextGroupPersistService,
	RolePersistService              : RolePersistService,
	GlarusUserPersistenceService    : GlarusUserPersistenceService,
	UserOperationService            : UserOperationService,
	TaskTypeService                 : TaskTypeService,
	RateMatrixService               : RateMatrixService
};