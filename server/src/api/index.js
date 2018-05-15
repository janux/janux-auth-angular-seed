'use strict';


var Services           = require('./services'),
    UserService        = require('./user-service'),
    AuthContextService = require('./auth-context-service'),
    RoleService        = require('./role-service'),
    OperationService   = require('./operation-service'),
    PartyService       = require('./party-service'),
    TimeEntryService   = require('./time-entry-service'),
    ResourceService    = require('./resource-service'),
    PartyGroupService  = require('./party-group-service'),
    VehicleService     = require('./vehicle-service'),
    ResellerService    = require('./reseller-service');


module.exports = {
	UserService                     : UserService.create(Services.UserPersistenceService),
	AuthContextService              : AuthContextService.create(Services.AuthContextPersistService, Services.AuthContextGroupPersistService),
	RoleService                     : RoleService.create(Services.RolePersistService),
	UserPersistenceService          : Services.UserPersistenceService,
	PartyService                    : PartyService.create(Services.PartyPersistenceService),
	OperationService                : OperationService.create(Services.OperationPersistService),
	TimeEntryService                : TimeEntryService.create(Services.TimeEntryPersistService),
	ResourceService                 : ResourceService.create(Services.ResourcePersistService),
	TimeEntryReportService          : Services.TimeEntryReportService,
	TimeEntryReportGuardService     : Services.TimeEntryReportGuardService,
	TimeEntryReportAttendanceService: Services.TimeEntryReportAttendanceService,
	TimeEntryReportSpecialOpsService: Services.TimeEntryReportSpecialOpsService,
	PartyGroupService               : PartyGroupService.create(Services.PartyGroupPersistenceService),
	VehicleService                  : VehicleService.create(Services.VehiclePersistenceService),
	ResellerService                 : ResellerService.create(Services.ResellerPersistenceService)
};