'use strict';

require('angular').module('demoService', [])

.factory('userService', require('./user-service.js'))
.factory('authContextService', require('./auth-context-service.js'))
.factory('roleService', require('./role-service.js'))
.factory('clientService', require('./client-mock-service.js'))
.factory('partyService', require('./party-service'))
.factory('resourceService', require('./resource-service'))
.factory('dateUtilService', require('./date-util-service'))
.factory('operationService',require('./operation-service'))
.factory('timeEntryService',require('./time-entry-service'))
.factory('partyGroupService',require('./party-group-service'))
.factory('resellerService',require('./reseller-service'))
.factory('vehicleService',require('./vehicle-service'))
.factory('rateMatrixService',require('./rate-matrix-service'))
.factory('invoiceService',require('./invoice-service'))
.factory('jnxStorage',require('./storage-service.js'))
.factory('nameQueryService', require('./name-query-service.js'))
.factory('dialogService', require('./dialog-service.js'))
.factory('userInvService', require('./user-inv-service'))
.factory('environmentService', require('./environment-service'))
.factory('validationService', require('./validation-service'))
.run(function() {
	console.log('janux auth seed correctly instantiated services');
});
