'use strict';

// var  _ = require('lodash');

require('common/demoService');

require('angular').module('appStaff', [
	'demoService'
])

.config(['$stateProvider', function($stateProvider)
{
	$stateProvider.state('staff', {
		url: '/staff',
		template: '<ui-view/>',
		authRequired: true,
		redirectTo: 'staff.list'
	})

	.state('staff.list', {
		url: '/staff-list',
		templateUrl: 'app/staff/index.html',
		authRequired: true,
		controller: require('./staff-controller.js'),
		resolve: {
			staff: ['partyService', function (partyService) {
				// return staffService.findAll();
				return partyService.findPeople();
			}]
		}
	})

	// Create Staff Member
	.state('staff.create', {
		url: '/staff-create',
		templateUrl: 'app/staff/create-staff.html',
		authRequired: true,
		controller: require('./staff-create-controller.js'),
		resolve: {}
	})

	// Edit specific staff member
	.state('staff.edit', {
		url: '/staff/{id}',
		templateUrl: 'app/staff/edit-staff.html',
		authRequired: true,
		controller: require('./edit-staff-controller.js'),
		resolve: {
			staff: ['partyService', '$stateParams', function(partyService, $stateParams){
				return partyService.findOne($stateParams.id);
			}]
		}
	});
}]);