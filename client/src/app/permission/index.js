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
		})
		.state('permissions.create-auth-context', {
			url: '/permissions/create-authorization-context',
			templateUrl: 'app/permission/create-auth-context.html',
			parent: 'auth-required',
			resolve: {
				permissionBits: ['authService', function(authService){
					return authService.loadPermissionBits();
				}]
			},
			controller: require('./create-auth-context.js')
		})
		.state('permissions.create-perm-bit', {
			url: '/permissions/create-permission-bit',
			templateUrl: 'app/permission/create-perm-bit.html',
			parent: 'auth-required',
			/*
			controller: ['$scope', function($scope){

			}]
			*/
		});
}]);
