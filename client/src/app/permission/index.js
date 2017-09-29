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
				}],
				groupsList: ['authService', function (authService) {
					return authService.loadAuthorizationContextGroupsList();
				}]
			},
			controller: require('./create-auth-context.js')
		})
		.state('permissions.edit-auth-context', {
			url: '/edit-auth-context/{contextGroupCode}/{contextName}',
			templateUrl: 'app/permission/auth-context.html',
			authRequired: true,
			resolve: {
				authContext: ['authService','$stateParams', function(authService, $stateParams){
					return authService.loadAuthorizationContextByName($stateParams.contextName);
				}],
				groupsList: ['authService', function (authService) {
					return authService.loadAuthorizationContextGroupsList();
				}]
			},
			controller: require('./edit-auth-context.js')
		})
		.state('permissions.create-auth-context-group', {
			url: '/create-auth-context-group',
			templateUrl: 'app/permission/auth-context-group.html',
			authRequired: true,
			resolve: {},
			controller: require('./create-auth-context-group.js')
		})
		.state('permissions.edit-auth-context-group', {
			url: '/edit-auth-context-group/{authContextGroupCode}',
			templateUrl: 'app/permission/auth-context-group.html',
			authRequired: true,
			resolve: {
				group: ['authService','$stateParams', function (authService, $stateParams) {
					return authService.loadAuthorizationContextGroup($stateParams.authContextGroupCode);
				}]
			},
			controller: require('./edit-auth-context-group.js')
		});
}]);