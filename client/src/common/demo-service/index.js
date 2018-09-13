'use strict';

require('angular').module('demoService', [])

.factory('userService', require('./user-service.js'))
.factory('authContextService', require('./auth-context-service.js'))
.factory('roleService', require('./role-service.js'))
.factory('staffService', require('./staff-mock-service.js'))
.factory('partyService', require('./party-service'))
.factory('dateUtilService', require('./date-util-service'))
.factory('partyGroupService',require('./party-group-service'))
.factory('dialogService', require('./dialog-service.js'))
.factory('userActionService', require('./user-action-service'))
.factory('validationService', require('./validation-service'))
.run(function() {
	console.log('janux auth seed correctly instantiated services');
});