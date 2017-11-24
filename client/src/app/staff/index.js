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
			staff: ['staffService', function (staffService) {
				return staffService.findAll();
			}]
		}
	})

	// Create Staff Member
	.state('staff.create', {
		url: '/staff-create',
		templateUrl: 'app/staff/create-staff.html',
		authRequired: true,
		//controller: require('./create-user-controller.js'),
		resolve: {}
	});
}]);