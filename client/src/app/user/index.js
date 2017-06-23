'use strict';

require('common/demoService');
var moment = require('moment');
var _ = require('lodash');

require('angular').module('appUsers', [
	'demoService'
])

.config(['$stateProvider', function($stateProvider)
{
	$stateProvider
	// List of users
	.state('users', {
		url: '/users',
		templateUrl: 'app/user/index.html',
		parent: 'auth-required',
		controller: require('./users-controller.js'),
		resolve: {
			users: ['userService', function (userService) {
				return userService.findBy('username', '').then(function(usersMatch) {
					return  _.map(usersMatch,function(user){
						user.cdate = moment(user.cdate).format('YYYY-MM-DD HH:mm:ss');
						return user;
					});
				});
			}]
		}
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