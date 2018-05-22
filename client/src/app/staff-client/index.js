'use strict';

// var  _ = require('lodash');

require('common/demoService');

require('angular').module('appStaffClient', [
	'demoService'
])

.config(['$stateProvider', function($stateProvider)
{
	$stateProvider.state('staffClient', {
		url: '/staff-client',
		template: '<ui-view/>',
		authRequired: true,
		redirectTo: 'staffClient.list'
	})
	.state('staffClient.list', {
		url: '/staff-client-list',
		templateUrl: 'app/staff-client/index.html',
		authRequired: true,
		controller: require('./staff-client-controller.js'),
		resolve: {
		}
	})

	// Create Staff Member
	.state('staffClient.create', {
		url: '/staff-client-create',
		templateUrl: 'app/staff-client/create-staff-client.html',
		authRequired: true,
		controller: require('./staff-client-create-controller.js'),
		resolve: {}
	})

	// Edit specific staff member
	.state('staffClient.edit', {
		url: '/staff-client/{id}',
		templateUrl: 'app/staff-client/edit-staff-client.html',
		authRequired: true,
		controller: require('./edit-staff-client-controller.js'),
		resolve: {
			staff: ['partyService', '$stateParams', function(partyService, $stateParams){
				return partyService.findOne($stateParams.id);
			}]
		}
	});
}]);