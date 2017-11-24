'use strict';

require('angular').module('demoService', [])

.factory('userService', require('./user-service.js'))
.factory('authContextService', require('./auth-context-service.js'))
.factory('roleService', require('./role-service.js'))
.factory('partyService', require('./party-service'))
.factory('dateUtilService', require('./date-util-service'))
.run(function() {
	console.log('janux auth seed correctly instantiated services');
});