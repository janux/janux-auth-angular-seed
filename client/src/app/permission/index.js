'use strict';

require('common/demoService');
//
// var _ = require('lodash');

require('angular').module('appPermissions', [
	'demoService'
])

.config(['$stateProvider', function($stateProvider)
{
	$stateProvider
		// Permissions Management
		.state('permissions.auth-contexts', {
			url: '/auth-contexts-list',
			templateUrl: 'app/permission/index.html',
			authRequired: true,
			controller: require('./perm-controller.js'),
			resolve: {
				permissionBits: ['authService', function(authService){
					return authService.loadPermissionBits();
				}],
				authContextGroups: ['authService', function(authService){
					return authService.loadAuthorizationContextGroups();
				}]
			}
		})
		.state('permissions.create-auth-context', {
			url: '/create-auth-context',
			templateUrl: 'app/permission/auth-context.html',
			authRequired: true,
			resolve: {
				permissionBits: ['authService', function(authService){
					return authService.loadPermissionBits();
				}]
			},
			controller: require('./create-auth-context.js')
		})
		.state('permissions.edit-auth-context', {
			url: '/edit-auth-context/{contextName}',
			templateUrl: 'app/permission/auth-context.html',
			authRequired: true,
			resolve: {
				authContext: ['authService','$stateParams', function(authService, $stateParams){
					return authService.loadAuthorizationContextByName($stateParams.contextName);
				}]
			},
			controller: require('./edit-auth-context.js')
		})
		.state('permissions.create-perm-bit', {
			url: '/create-permission-bit',
			templateUrl: 'app/permission/create-perm-bit.html',
			authRequired: true,
			resolve: {}
			//
			// TODO: Implement permission bits CRUD functionality
			// controller: ['$scope', function($scope){
			//
			// }]
		});
}]);