'use strict';

require('common/demoService');

require('angular').module('appPermissions', [
	'demoService'
])

.config(['$stateProvider', function($stateProvider)
{
	$stateProvider
		// Permissions Management
		.state('permissions', {
			url: '/permissions',
			templateUrl: 'app/permission/index.html',
			parent: 'auth-required',
			controller: require('./perm-controller.js'),
			resolve: {
				permissionBits: ['authService', function(authService){
					return authService.loadPermissionBits();
				}],
				authContexts: ['authService', function(authService){
					return authService.loadAuthorizationContexts();
				}]
			}
		});
}]);