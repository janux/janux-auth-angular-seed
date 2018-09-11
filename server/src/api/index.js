'use strict';


var Services           = require('./services'),
    UserService        = require('./user/user-service'),
    UserInvService     = require('./user/user-inv-service'),
    AuthContextService = require('./auth-context-service'),
    RoleService        = require('./role-service'),
    OperationService   = require('./operation-service'),
    PartyService       = require('./party-service'),
    TimeEntryService   = require('./time-entry-service'),
    ResourceService    = require('./resource-service'),
    PartyGroupService  = require('./party-group-service'),
    VehicleService     = require('./vehicle-service'),
    ResellerService    = require('./reseller-service'),
    RateMatrixService  = require('./rate-matrix-service'),
    InvoiceService     = require('./invoice-service'),
    EnvironmentService = require('./enviroment-service');


module.exports = {
	UserService                     : UserService.create(Services.GlarusUserPersistenceService),
	UserInvService                  : UserInvService.create(Services.UserInvitationService),
	AuthContextService              : AuthContextService.create(Services.AuthContextPersistService, Services.AuthContextGroupPersistService),
	RoleService                     : RoleService.create(Services.RolePersistService),
	UserPersistenceService          : Services.UserPersistenceService,
	PartyService                    : PartyService.create(Services.PartyPersistenceService),
	OperationService                : OperationService.create(Services.OperationPersistService, Services.UserOperationService),
	TimeEntryService                : TimeEntryService.create(Services.TimeEntryPersistService),
	ResourceService                 : ResourceService.create(Services.ResourcePersistService),
	TimeEntryReportService          : Services.TimeEntryReportService,
	TimeEntryReportGuardService     : Services.TimeEntryReportGuardService,
	TimeEntryReportAttendanceService: Services.TimeEntryReportAttendanceService,
	TimeEntryReportSpecialOpsService: Services.TimeEntryReportSpecialOpsService,
	PartyGroupService               : PartyGroupService.create(Services.PartyGroupPersistenceService),
	VehicleService                  : VehicleService.create(Services.VehiclePersistenceService),
	ResellerService                 : ResellerService.create(Services.ResellerPersistenceService),
	RateMatrixService               : RateMatrixService.create(Services.RateMatrixService),
	InvoiceService                  : InvoiceService.create(Services.InvoiceService, Services.UserInvoiceService),
	EnvironmentService              : EnvironmentService.create()
};
