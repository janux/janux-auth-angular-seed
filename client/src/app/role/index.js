'use strict';

require('common/demoService');

require('angular').module('appRoles', [
	'demoService'
])

.config(['$stateProvider', function($stateProvider)
{
	$stateProvider.state('permissions', {
		url: '/permissions/roles',
		templateUrl: 'app/role/index.html',
		parent: 'auth-required',
		resolve: {
			roles: ['authService', function(authService) {
				return authService.loadRoles();
			}]
		},
		controller: require('./roles-controller')
	});
}]);