'use strict';

require('common/demoService');
var moment = require('moment');
var _ = require('lodash');

require('angular').module('appUsers', [
	'demoService'
])

.config(['$stateProvider', function($stateProvider)
{
	// List of users
	$stateProvider.state('users', {
		url:'/users',
		template: '<ui-view/>',
		authRequired: true,
		redirectTo: 'users.list'
	})
	.state('users.list', {
		url: '/users-list',
		templateUrl: 'app/user/index.html',
		authRequired: true,
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
		url: '/create',
		templateUrl: 'app/user/create-user.html',
		authRequired: true,
		controller: require('./create-user-controller.js'),
		resolve: {}
	})
	// Edit specific user
	.state('users.edit', {
		url: '/edit/{userId}',
		templateUrl: 'app/user/edit-user.html',
		authRequired: true,
		controller: require('./edit-user-controller.js'),
		resolve: {
			user: ['userService', '$stateParams', function(userService, $stateParams){
				return userService.findById($stateParams.userId);
			}]
		}
	});
}]);