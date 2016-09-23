'use strict';

require('common/demoService');

require('angular').module('appUsers', [
	'demoService'
])

.config(['$stateProvider', function($stateProvider)
{
	$stateProvider
	// List of users
	.state('users', {
		url: '/users',
		templateUrl: 'app/user/users.html',
		parent: 'auth-required',
		controller: require('./users-controller.js')
	})
	// Edit specific user
	.state('users.create', {
		url: '/users/create',
		templateUrl: 'app/user/create-user.html',
		parent: 'auth-required',
		controller: require('./create-user-controller.js'),
		resolve: {}
	})
	// Edit specific user
	.state('users.edit', {
		url: '/users/edit/{userId}',
		templateUrl: 'app/user/edit-user.html',
		parent: 'auth-required',
		controller: require('./edit-user-controller.js'),
		resolve: {
			user: ['userService', '$stateParams', function(userService, $stateParams){
				return userService.findById($stateParams.userId);
			}]
		}
	});
}]);