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
		.state('permissions.authcontexts', {
			url: '/auth-contexts-list',
			templateUrl: 'app/permission/index.html',
			authRequired: true,
			controller: require('./perm-controller.js'),
			resolve: {
				authContextGroups: ['authContextService', function(authContextService){
					return authContextService.findGroups();
				}]
			}
		})
		.state('permissions.create-auth-context', {
			url: '/create-auth-context',
			templateUrl: 'app/permission/auth-context.html',
			authRequired: true,
			resolve: {
				groupsList: ['authContextService', function (authContextService) {
					return authContextService.findGroupsList();
				}]
			},
			controller: require('./create-auth-context')
		})
		.state('permissions.copy-auth-context', {
			url: '/copy-auth-context/{copyFromContext}',
			templateUrl: 'app/permission/auth-context.html',
			authRequired: true,
			resolve: {
				authContext: ['authContextService','$stateParams', function(authContextService, $stateParams){
					return authContextService.findOneByName($stateParams.copyFromContext);
				}],
				groupsList: ['authContextService', function (authContextService) {
					return authContextService.findGroupsList();
				}]
			},
			controller: require('./edit-auth-context')
		})
		.state('permissions.edit-auth-context', {
			url: '/edit-auth-context/{contextGroupCode}/{contextName}',
			templateUrl: 'app/permission/auth-context.html',
			authRequired: true,
			resolve: {
				authContext: ['authContextService','$stateParams', function(authContextService, $stateParams){
					return authContextService.findOneByName($stateParams.contextName);
				}],
				groupsList: ['authContextService', function (authContextService) {
					return authContextService.findGroupsList();
				}]
			},
			controller: require('./edit-auth-context')
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
				group: ['authContextService','$stateParams', function (authContextService, $stateParams) {
					return authContextService.findGroupByCode($stateParams.authContextGroupCode);
				}]
			},
			controller: require('./edit-auth-context-group')
		});
}]);