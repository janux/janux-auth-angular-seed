'use strict';

require('common/demoService');

var _ = require('lodash');

require('angular').module('appPermissions', [
	'demoService'
])

.config(['$stateProvider', function($stateProvider)
{
	$stateProvider
		// Permissions Management
		.state('permissions.auth-contexts', {
			url: '/permissions/authorization-contexts',
			templateUrl: 'app/permission/index.html',
			parent: 'auth-required',
			controller: require('./perm-controller.js'),
			resolve: {
				permissionBits: ['authService', function(authService){
					return authService.loadPermissionBits();
				}],
				authContexts: ['authService', function(authService){
					return authService.loadAuthorizationContexts().then(function (response) {
						return _.values(response);
					});
				}]
			}
		})
		.state('permissions.create-auth-context', {
			url: '/permissions/create-authorization-context',
			templateUrl: 'app/permission/auth-context.html',
			parent: 'auth-required',
			resolve: {
				permissionBits: ['authService', function(authService){
					return authService.loadPermissionBits();
				}]
			},
			controller: require('./create-auth-context.js')
		})
		.state('permissions.edit-auth-context', {
			url: '/permissions/edit-authorization-context/{contextName}',
			templateUrl: 'app/permission/auth-context.html',
			parent: 'auth-required',
			resolve: {
				authContext: ['authService','$stateParams', function(authService, $stateParams){
					return authService.loadAuthorizationContextByName($stateParams.contextName);
				}]
			},
			controller: require('./edit-auth-context.js')
		})
		.state('permissions.create-perm-bit', {
			url: '/permissions/create-permission-bit',
			templateUrl: 'app/permission/create-perm-bit.html',
			parent: 'auth-required'
			//
			// TODO: Implement permission bits CRUD functionality
			// controller: ['$scope', function($scope){
			//
			// }]
		});
}]);