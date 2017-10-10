'use strict';

// var  _ = require('lodash');

require('common/demoService');

require('angular').module('appRoles', [
	'demoService'
])

.config(['$stateProvider', function($stateProvider)
{
	$stateProvider.state('permissions', {
		url: '/permissions',
		template: '<ui-view/>',
		authRequired: true,
		redirectTo: 'permissions.roles'
	})
	.state('permissions.roles', {
		url: '/roles-list',
		templateUrl: 'app/role/index.html',
		authRequired: true,
		resolve: {
			roles: ['roleService', function(roleService) {
				return roleService.findAll();
			}]
		},
		controller: require('./roles-controller')
	})
	.state('permissions.edit-role', {
		url: '/edit-role/{roleName}',
		templateUrl: 'app/role/edit-role.html',
		authRequired: true,
		resolve: {
			authContextGroups: ['authContextService', function(authContextService){
				return authContextService.findGroups();
			}],
			role: ['roleService','$stateParams', function(roleService, $stateParams) {
				return roleService.findOneByName($stateParams.roleName);
			}]
		},
		controller: require('./role-edit-controller')
	})
	.state('permissions.create-role', {
		url: '/create-role',
		templateUrl: 'app/role/create-role.html',
		authRequired: true,
		resolve: {
			authContextGroups: ['authContextService', function(authContextService){
				return authContextService.findGroups();
			}]
		},
		controller: require('./role-create-controller')
	});
}]);