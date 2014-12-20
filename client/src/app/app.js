'use strict'; var angular = require('angular');

require('angular-ui-router');
require('angular-translate');
require('angular-translate-loader-static-files');
require('common/security');


angular.module('MyApp',[ 'ui.router', 'security', 'pascalprecht.translate' ])

.run([	  '$rootScope','$state','$stateParams',
	function($rootScope , $state , $stateParams) { 
		$rootScope.$state       = $state;
		$rootScope.$stateParams = $stateParams;
	}
])

.config([ '$stateProvider','$urlRouterProvider','$translateProvider',
  function($stateProvider , $urlRouterProvider , $translateProvider) {

		$translateProvider.useStaticFilesLoader({
			prefix: 'static/locale/',
			suffix: '.json'
		});

		$translateProvider.preferredLanguage('en');
		$translateProvider.fallbackLanguage('en');

		// redirect from 1st parm to 2nd parm
		$urlRouterProvider.when('/c?id', '/contacts/:id');
		
		// redirect invalid urls to the home page
		$urlRouterProvider.otherwise('/');

		// 
		// State Configuration
		//
		
		//
		// This is boilerplate code that we must add to each state for which we
		// require an authenticated user, so we define it once here rather than
		// having to repeat it below.  Note that if the $authorization provider had
		// been injected in this method, we would be able to use instead:
		//
		//   authenticate: $authorization.requireAuthenticatedUser
		//
		// but angular kept throwing an error to the effect that it could not find
		// the $authentication provider; I speculate that this is because
		// $authenticator depends on security/retryQueue, which may not yet have
		// been instantiated at config time of the myApp module. 
		//
		// In the original angular-app, the $authorization provider is injected in a
		// 'projects' module which has its own routes definition.  It would be
		// interesting to see whether moving the definition of the states to a
		// different module would allay this issue and make it possible to inject
		// the $authorization provider. As an alternative, could the $authorization
		// provider be rewritten so that it does not depend on the security module
		// but raises an event that is then handled by the security module?
		//
		var authenticate = {
			authenticate: ['$authorization', function($authorization) {
				return $authorization.requireAuthenticatedUser();
			}]
		};
		
		$stateProvider.state('dashboard', {
			// default state
			url: '/',
			templateUrl: 'static/app/dashboard.html'
		})

		.state('logout', {
			url: '/logout',
			templateUrl: 'static/app/goodbye.html',
		})

		.state('users', {
			url: '/users',
			templateUrl: 'static/app/user/index.html',
			resolve: authenticate
		})

		.state('roles', {
			url: '/roles',
			templateUrl: 'static/app/role/index.html',
			resolve: authenticate
		})

		.state('permissions', {
			url: '/permissions',
			templateUrl: 'static/app/permission/index.html',
			resolve: authenticate
		});
	}
]);

