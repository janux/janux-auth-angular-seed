'use strict';

var  _ = require('lodash');

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
			roles: ['authService', function(authService) {
				return authService.loadRoles();
			}]
		},
		controller: require('./roles-controller')
	})
	.state('permissions.edit-role', {
		url: '/edit-role/{roleName}',
		templateUrl: 'app/role/edit-role.html',
		authRequired: true,
		resolve: {
			authContexts: ['authService', function(authService){
				return authService.loadAuthorizationContexts().then(function (response) {
					return _.values(response);
				});
			}],
			role: ['authService','$stateParams', function(authService, $stateParams) {
				return authService.loadRoleByName($stateParams.roleName);
			}]
		},
		controller: require('./role-edit-controller')
	});
}]);