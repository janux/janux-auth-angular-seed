'use strict';

require('common/demoService');

require('angular').module('appUsers', [
	'demoService'
])

.config(['$stateProvider', function($stateProvider)
{
	$stateProvider
	.state('users', {
		url: '/users',
		templateUrl: 'app/user/index.html',
		parent: 'auth-required',
		controller: require('./user-controller.js')
	});
}]);