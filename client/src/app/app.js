'use strict'; 

var angular = require('angular');

require('angular-ui-router');
require('angular-translate');
require('angular-translate-loader-static-files');
require('angular-aside');
require('common/jsonrpc');
require('common/jnxSecurity');
require('common/directives');
require('common/demoService');
require('app/users');
require('app/permissions');

angular.module('MyApp',[
	'jsonrpc',
	'ui.router',
	'ngAside',
	'jnxSecurity',
	'pascalprecht.translate',
	'commonDirectives',
	'demoService',
	'appUsers',
	'appPermissions'
])

.run([  '$rootScope','$state','$stateParams','security',
function($rootScope , $state , $stateParams , security) { 
	$rootScope.$state       = $state;
	$rootScope.$stateParams = $stateParams;

	// On page reload, check to see whether the user logged in previously
	security.requestCurrentUser();
}])

.config(['$stateProvider','$urlRouterProvider','$locationProvider','$translateProvider',
function( $stateProvider , $urlRouterProvider , $locationProvider , $translateProvider) {

	$translateProvider.useStaticFilesLoader({
		prefix: 'locale/',
		suffix: '.json'
	});

	$translateProvider.preferredLanguage('en');
	$translateProvider.fallbackLanguage('en');

	// redirect from 1st parm to 2nd parm
	$urlRouterProvider.when('/c?id', '/contacts/:id');
	
	// redirect invalid urls to the home page
	$urlRouterProvider.otherwise('/');
	
	// HTML5 History API enabled
	$locationProvider.html5Mode(true);

	// 
	// State Configuration
	//
	
	//
	// This is boilerplate code that we must add to each state for which we
	// require an authenticated user, so we define it once here rather than
	// having to repeat it below.  Note that if the $jnxAuth provider had
	// been injected in this method, we would be able to use instead:
	//
	//   authenticate: $jnxAuth.requireAuthenticatedUser
	//
	// but angular kept throwing an error to the effect that it could not find
	// the $authentication provider; I speculate that this is because
	// $authenticator depends on security/retryQueue, which may not yet have
	// been instantiated at config time of the myApp module. 
	//
	// In the original angular-app, the $jnxAuth provider is injected in a
	// 'projects' module which has its own routes definition.  It would be
	// interesting to see whether moving the definition of the states to a
	// different module would allay this issue and make it possible to inject
	// the $jnxAuth provider. As an alternative, could the $jnxAuth
	// provider be rewritten so that it does not depend on the security module
	// but raises an event that is then handled by the security module?
	//
	var authenticate = {
		authenticate: ['$jnxAuth', function($jnxAuth) {
			return $jnxAuth.requireAuthenticatedUser();
		}]
	};
	
	$stateProvider
	.state('auth-required', {
		abstract: true,
		template: '<ui-view/>',
		resolve: {
			currentUser: ['$jnxAuth', function($jnxAuth) {
				return $jnxAuth.requireAuthenticatedUser();
			}]
		}
	})

	.state('dashboard', {
		// default state
		url: '/',
		templateUrl: 'app/dashboard.html'
	})

	.state('goodbye', {
		url: '/goodbye',
		templateUrl: 'app/goodbye.html',
	})

	.state('roles', {
		url: '/roles',
		templateUrl: 'app/role/index.html',
		resolve: authenticate
	});
}])

.controller('asideMenu', ['$scope','$aside',
function($scope, $aside) {

	$scope.asideState = {
		open: false
	};
	$scope.openMenu = function () {
		$scope.asideState = {
			open: true,
			position: 'right'
		};

		function postClose() {
			$scope.asideState.open = false;
		}

		$aside.open({
			templateUrl: 'app/nav-bar.html',
			placement: 'left',
			size: 'lg',
			backdrop: true,
			controller: ['$scope','$modalInstance',function($scope, $modalInstance) {
				$scope.ok = function() {
					$modalInstance.close();
				};
				$scope.cancel = function() {
					$modalInstance.dismiss();
				};
			}]
		}).result.then(postClose, postClose);
	};
}]);

