'use strict';
var angular = require('angular');

require('angular-ui-router');
require('common/security');


angular.module('MyApp',[
	'ui.router',
	'security'
])

.run([    '$rootScope','$state','$stateParams', 'security',
	function($rootScope , $state , $stateParams, security) {
		$rootScope.$state = $state;
		$rootScope.$stateParams = $stateParams;

		// See if we can find an authenticated session
		security.requestCurrentUser();
		console.log('user', security.currentUser);
	}
])

.config([ '$stateProvider','$urlRouterProvider',
	function($stateProvider , $urlRouterProvider) {
		
		// redirect from 1st parm to 2nd parm
		$urlRouterProvider.when('/c?id', '/contacts/:id');
		
		// redirect invalid urls to the home page
		$urlRouterProvider.otherwise('/');

		// 
		// State Configuration
		//
		
		$stateProvider.state('users', {
			// default state
			url: '/',
			templateUrl: 'app/user/index.html'
		})

		.state('roles', {
			url: '/roles',
			templateUrl: 'app/role/index.html'
		})

		.state('permissions', {
			url: '/permissions',
			templateUrl: 'app/permission/index.html'
		});
	}
]);

