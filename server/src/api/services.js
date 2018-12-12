'use strict';
var UserPersistence                        = require('janux-persist').UserService,
    UserActionServiceDev                   = require('janux-persist').UserActionServiceDev,
    UserActionServiceProd                  = require('janux-persist').UserActionServiceProd,
    PartyServiceImpl                       = require('janux-persist').PartyServiceImpl,
    AuthContextPersistence                 = require('janux-persist').AuthContextService,
    AuthContextGroupService                = require('janux-persist').AuthContextGroupServiceImpl,
    RolePersistence                        = require('janux-persist').RoleService,
    GroupService                           = require('janux-persist').GroupServiceImpl,
    PartyGroupServiceImpl                  = require('janux-persist').PartyGroupServiceImpl,
    ResellerServiceImpl                    = require('janux-persist').ResellerServiceImpl,
    CommServiceImpl                        = require('janux-persist').CommService,
    OperationServiceImpl                   = require('glarus-services').OperationServiceImpl,
    ResourceServiceImpl                    = require('glarus-services').ResourceServiceImpl,
    TimeEntryServiceImpl                   = require('glarus-services').TimeEntryServiceImpl,
    TimeEntryReportServiceImpl             = require('glarus-services').TimeEntryReportService,
    TimeEntryReportGuardServiceImpl        = require('glarus-services').TimeEntryReportGuardService,
    TimeEntryReportAttendanceServiceImpl   = require('glarus-services').TimeEntryReportAttendanceService,
    TimeEntryReportSpecialOpsServiceImpl   = require('glarus-services').TimeEntryReportSpecialOpsService,
    VehicleServiceImpl                     = require('glarus-services').VehicleServiceImpl,
    GlarusUserPersistence                  = require('glarus-services').UserServiceImpl,
    UserOperationServiceImpl               = require('glarus-services').UserOperationService,
    TaskTypeServiceImpl                    = require('glarus-services').TaskTypeServiceImpl,
    RateMatrixServiceImpl                  = require('glarus-services').RateMatrixServiceImpl,
    RateMatrixResellerServiceImpl          = require('glarus-services').RateMatrixResellerService,
    InvoiceServiceImpl                     = require('glarus-services').InvoiceServiceImpl,
    InvoiceCalculatorService               = require('glarus-services').InvoiceCalculatorServiceImpl,
    InvoiceTimeEntryServiceImpl            = require('glarus-services').InvoiceTimeEntryServiceImpl,
    InvoiceSpecialServiceReportServiceImpl = require('glarus-services').InvoiceSpecialServiceReportService,
    UserInvoiceServiceImpl                 = require('glarus-services').UserInvoiceServiceImpl;

var config                              = require('config'),
    appContext                          = config.serverAppContext,
    DAOs                                = require('./daos'),
    AccountDao                          = DAOs[appContext.dao.accountDao],
    AccountInvDao                       = DAOs[appContext.dao.accountInvDao],
    StaffDao                            = DAOs[appContext.dao.staffDao],
    PartyDao                            = DAOs[appContext.dao.partyDao],
    AuthContextDAO                      = DAOs[appContext.dao.authContextDao],
    RoleDAO                             = DAOs[appContext.dao.roleDao],
    GroupContentDao                     = DAOs[appContext.dao.groupContentDao],
    GroupDao                            = DAOs[appContext.dao.groupDao],
    GroupAttributeValueDao              = DAOs[appContext.dao.groupAttributeValueDao],
    PartyPersistenceService             = new PartyServiceImpl(PartyDao, StaffDao),
    CommDataSource                      = DAOs[appContext.dao.commDataSource],

    // Begin glarus services DAOs.
    VehicleDao                          = DAOs[appContext.dao.vehicleDao],
    TimeEntryPrincipalDao               = DAOs[appContext.dao.timeEntryPrincipalDao],
    OperationDao                        = DAOs[appContext.dao.operationDao],

    OperationAttributeDao               = DAOs[appContext.dao.operationAttributeDao],
    OperationPrincipalDao               = DAOs[appContext.dao.operationPrincipalDao],
    TimeEntryDao                        = DAOs[appContext.dao.timeEntryDao],
    ResourceDao                         = DAOs[appContext.dao.resourceDao],
    CurrentResourceDao                  = DAOs[appContext.dao.currentResourceDao],
    TimeEntryAttributeDao               = DAOs[appContext.dao.timeEntryAttributeDao],
    TimeEntryResourceDao                = DAOs[appContext.dao.timeEntryResourceDao],
    TaskTypeDao                         = DAOs[appContext.dao.taskTypeDao],
    RateDao                             = DAOs[appContext.dao.rateDao],
    RateMatrixDao                       = DAOs[appContext.dao.rateMatrixDao],
    InvoiceDao                          = DAOs[appContext.dao.invoiceDao],
    InvoiceOperationDao                 = DAOs[appContext.dao.invoiceOperationDao],
    InvoiceItemDao                      = DAOs[appContext.dao.invoiceItemDao],
    ExpenseDao                          = DAOs[appContext.dao.expenseDao],
    InvoiceItemTEDao                    = DAOs[appContext.dao.invoiceItemTE],
    // End glarus services DAOs.


    ResourcePersistService              = new ResourceServiceImpl(ResourceDao, PartyPersistenceService, VehicleDao, CurrentResourceDao, TimeEntryResourceDao),
    VehiclePersistenceService           = new VehicleServiceImpl(VehicleDao),
    TaskTypeService                     = new TaskTypeServiceImpl(TaskTypeDao),
    InvoiceCalculatorServicePersistence = new InvoiceCalculatorService(
	    InvoiceDao,
	    InvoiceItemDao,
	    ExpenseDao,
	    InvoiceItemTEDao,
	    PartyPersistenceService,
	    OperationDao,
	    OperationAttributeDao,
	    TimeEntryDao,
	    TimeEntryAttributeDao,
	    TimeEntryPrincipalDao,
	    ResourcePersistService,
	    VehicleDao,
	    TimeEntryResourceDao,
	    RateMatrixDao,
	    RateDao,
	    TaskTypeDao,
	    TaskTypeService),
    TimeEntryPersistService             = new TimeEntryServiceImpl(OperationDao, TimeEntryDao, TimeEntryAttributeDao, TimeEntryPrincipalDao, TimeEntryResourceDao, ResourcePersistService, PartyPersistenceService, VehicleDao, InvoiceCalculatorServicePersistence, OperationAttributeDao, InvoiceItemTEDao,InvoiceItemDao,InvoiceDao),
    OperationPersistService             = new OperationServiceImpl(OperationDao, TimeEntryPersistService, ResourcePersistService, PartyPersistenceService, VehicleDao, CurrentResourceDao, OperationPrincipalDao, OperationAttributeDao),
    RateMatrixService                   = new RateMatrixServiceImpl(PartyPersistenceService, RateMatrixDao, RateDao, TaskTypeDao, TaskTypeService, InvoiceCalculatorServicePersistence),
    GroupPersistService                 = new GroupService(GroupDao, GroupContentDao, GroupAttributeValueDao),
    PartyGroupPersistenceService        = new PartyGroupServiceImpl(PartyPersistenceService, GroupPersistService),
    UserPersistenceService              = UserPersistence.createInstance(AccountDao, PartyPersistenceService),
    ResellerPersistenceService          = new ResellerServiceImpl(PartyPersistenceService, PartyGroupPersistenceService),
    AuthContextPersistService           = AuthContextPersistence.createInstance(AuthContextDAO),
    AuthContextGroupPersistService      = new AuthContextGroupService(AuthContextPersistService, GroupPersistService),
    RolePersistService                  = RolePersistence.createInstance(RoleDAO),
    GlarusUserPersistenceService        = new GlarusUserPersistence(UserPersistenceService, PartyGroupPersistenceService, PartyPersistenceService, RolePersistService),
    UserOperationService                = new UserOperationServiceImpl(GlarusUserPersistenceService, OperationPersistService),
    TimeEntryReportService              = new TimeEntryReportServiceImpl(OperationPersistService, TimeEntryPersistService, RateMatrixService, GlarusUserPersistenceService),
    TimeEntryReportGuardService         = new TimeEntryReportGuardServiceImpl(OperationPersistService, TimeEntryPersistService, RateMatrixService, GlarusUserPersistenceService),
    TimeEntryReportSpecialOpsService    = new TimeEntryReportSpecialOpsServiceImpl(OperationPersistService, TimeEntryPersistService, RateMatrixService, GlarusUserPersistenceService),
    TimeEntryReportAttendanceService    = new TimeEntryReportAttendanceServiceImpl(OperationPersistService, TimeEntryPersistService),
    RateMatrixResellerService           = new RateMatrixResellerServiceImpl(RateMatrixService, ResellerPersistenceService),
    InvoiceService                      = new InvoiceServiceImpl(InvoiceDao, InvoiceItemDao, ExpenseDao, InvoiceOperationDao, InvoiceItemTEDao, PartyPersistenceService, TimeEntryDao, TimeEntryPersistService, RateMatrixService, OperationDao, InvoiceCalculatorServicePersistence, OperationPersistService, RateMatrixResellerService),
    InvoiceTimeEntryService             = new InvoiceTimeEntryServiceImpl(InvoiceItemTEDao, InvoiceItemDao, InvoiceDao, TimeEntryDao),
    UserInvoiceService                  = new UserInvoiceServiceImpl(GlarusUserPersistenceService, InvoiceService),
    CommService                         = CommServiceImpl.createInstance(CommDataSource, config.serverAppContext.smtp),
    InvoiceSpecialServiceReportService  = new InvoiceSpecialServiceReportServiceImpl(InvoiceService, OperationPersistService, InvoiceDao, InvoiceOperationDao);

var UserInvitationPersistenceService = (config.serverAppContext.smtp.enabled) ? UserActionServiceProd.createInstance(AccountInvDao, UserPersistenceService, PartyPersistenceService, CommService)
	: UserActionServiceDev.createInstance(AccountInvDao, UserPersistenceService, PartyPersistenceService, CommService);

module.exports = {
	PartyPersistenceService           : PartyPersistenceService,
	ResourcePersistService            : ResourcePersistService,
	TimeEntryPersistService           : TimeEntryPersistService,
	OperationPersistService           : OperationPersistService,
	TimeEntryReportService            : TimeEntryReportService,
	TimeEntryReportGuardService       : TimeEntryReportGuardService,
	TimeEntryReportAttendanceService  : TimeEntryReportAttendanceService,
	TimeEntryReportSpecialOpsService  : TimeEntryReportSpecialOpsService,
	VehiclePersistenceService         : VehiclePersistenceService,
	UserPersistenceService            : UserPersistenceService,
	GroupPersistService               : GroupPersistService,
	PartyGroupPersistenceService      : PartyGroupPersistenceService,
	ResellerPersistenceService        : ResellerPersistenceService,
	AuthContextPersistService         : AuthContextPersistService,
	AuthContextGroupPersistService    : AuthContextGroupPersistService,
	RolePersistService                : RolePersistService,
	GlarusUserPersistenceService      : GlarusUserPersistenceService,
	UserOperationService              : UserOperationService,
	TaskTypeService                   : TaskTypeService,
	RateMatrixService                 : RateMatrixService,
	InvoiceService                    : InvoiceService,
	InvoiceTimeEntryService           : InvoiceTimeEntryService,
	UserInvoiceService                : UserInvoiceService,
	CommService                       : CommService,
	UserInvitationService             : UserInvitationPersistenceService,
	InvoiceSpecialServiceReportService: InvoiceSpecialServiceReportService
};
