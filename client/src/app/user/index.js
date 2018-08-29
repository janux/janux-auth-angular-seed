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
			users: ['userService','security', function (userService, security) {
				return userService.findBy('username', '', security.currentUser.username)
				.then(function(usersMatch) {
					return  _.map(usersMatch,function(user){
						user.cdate = moment(user.cdate).format('YYYY-MM-DD HH:mm:ss');
						return user;
					});
				})
				.then(function (result) {
					console.log('Users list', result);
					var parties = _.map(result, function (o) {

						o.usersDisplayName = o.contact.displayName;
						o.usersDisplayEmail = o.contact.emails[0].address;
						o.usersDisplayRole = o.roles;

						return o;
					});
					return parties;

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
		resolve: {
			roles: ['roleService', function(roleService) {
				return roleService.findAll().then(function (roles) {
					return _.sortBy(_.mapValues(roles,function (role) {
						role.enabled = false;
						return role;
					}),'sortOrder');
				});
			}]
		}
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
			}],
			roles: ['roleService', 'user', function(roleService, user) {
				return roleService.findAll().then(function (roles) {
					return _.sortBy(_.mapValues(roles,function (role) {
						role.enabled = (user.roles.indexOf(role.name)!==-1);
						return role;
					}),'sortOrder');
				});
			}]
		}
	})
	// Edit specific user
	.state('register', {
		url: '/register/{code}',
		templateUrl: 'app/user/register.html',
		authRequired: false,
		controller: require('./register-controller.js'),
		resolve: {
			invitation: ['userInvService','$stateParams','$state','dialogService', function (userInvService,$stateParams,$state,dialogService) {
				return userInvService.findByCode($stateParams.code).then(function (invitation) {
					// console.log('find invitation by code', $stateParams.code, invitation);
					return invitation;
				}, function () {
					dialogService.info('user.dialogs.invalidInvitation');
					$state.go('login');
					return null;
				});
			}]
		}
	});
}]);
