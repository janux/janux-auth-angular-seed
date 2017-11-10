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
		authRequired: true
	});
}]);