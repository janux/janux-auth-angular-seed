'use strict';

var angular = require('angular');

require('angular-ui-router');
require('angular-translate');
require('angular-translate-loader-static-files');
require('angular-aside');
require('angular-material');
require('datetimepicker');
require('angular-animate');
require('angular-aria');
require('angular-local-storage');
require('angular-jwt');
require('drag-and-drop-lists');
require('drag-drop-mobile');
require('common/config');
require('common/jsonrpc');
require('common/jnxSecurity');
require('common/directives');
require('common/demoService');
require('app/users');
require('app/permissions');
require('app/roles');
require('app/staff');

angular.module('MyApp',[
	'jsonrpc',
	'ui.router',
	'ngAside',
	'ngMaterial',
	'ngMaterialDatePicker',
	'jnxSecurity',
	'pascalprecht.translate',
	'dndLists',
	'commonDirectives',
	'demoService',
	'appUsers',
	'appStaff',
	'appPermissions',
	'config',
	'appRoles',
	'LocalStorageModule',
	'angular-jwt'
])

.run([  '$rootScope','$state','$stateParams','security','$anchorScroll',
function($rootScope , $state , $stateParams , security , $anchorScroll) {
	$rootScope.$state       = $state;
	$rootScope.$stateParams = $stateParams;

	$rootScope.$on('$stateChangeStart', function(event, toState, params) {
		// When we change state we look for top to set the scroll up
		$anchorScroll('top');

		//
		// This is necessary because the abstract 'auth-required' parent state resolve is only
		// executed once by design of the ui-router, and we have to add the resolve to
		// each child state for authentication to work as intended; see comment
		// further down where the abstract 'auth-required' state is defined
		//
		// Ensure user authentication when state is changing
		if(toState.authRequired){

			// console.debug('toState before', toState);
			toState.resolve = angular.extend( toState.resolve || {}, {
				currentUser: ['$jnxAuth', function($jnxAuth) {
					return $jnxAuth.requireAuthenticatedUser();
				}]
			});
			// console.log('toState after', toState);
		}

		if (toState.redirectTo) {
			event.preventDefault();
			$state.go(toState.redirectTo, params, {location: 'replace'});
		}
	});

	$rootScope.$on('jsonrpc', function (event, data) {
		console.log('Catching ' + data);
		if(data === 'INVALID_TOKEN'){
			//There was a json rpc post and the server reject the token we send ( for whatever reason).
			security.forceLogout();
			$state.go('login', {goodbye:'FORCED_LOGOUT'});
			//We need to go to login.
		}
	});

	// On page reload, check to see whether the user logged in previously
	security.requestCurrentUser();
}])

.config(['$stateProvider','$urlRouterProvider','$locationProvider','$translateProvider','localStorageServiceProvider',
function( $stateProvider , $urlRouterProvider , $locationProvider , $translateProvider,localStorageServiceProvider) {

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

	localStorageServiceProvider.setPrefix('janux-demo');

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
	// var authenticate = {
	// 	authenticate: ['$jnxAuth', function($jnxAuth) {
	// 		return $jnxAuth.requireAuthenticatedUser();
	// 	}]
	// };

	$stateProvider
	// .state('auth-required', {
	// 	abstract: true,
	// 	template: '<ui-view/>',
	// 	resolve: {
	// 		currentUser: ['$jnxAuth', function($jnxAuth) {
	// 			return $jnxAuth.requireAuthenticatedUser();
	// 		}]
	// 	}
	// })

	// this state is used to switch between the login & default landing state
	.state('home', {
		url: '/',

		template: '',

		resolve: {
			currentUser: ['security', function(security) {
				// console.debug('requestCurrentUser from home.resolve.currentUser');
				return security.requestCurrentUser();
			}]
		},

		controller: ['config','$scope', '$state', 'security', function(config,$scope, $state, security) {
			if (security.isAuthenticated()) {
				$state.go(config.defaultState);
			} else {
				$state.go('login');
			}
		}]
	})

	.state('login', {
		url: '/login/{goodbye}',
		templateUrl: 'common/security/login/form.html',
		resolve: {
			isModal: function() { return false;}
		},
		controller: 'loginController'
	});
}])

.controller('AppCtrl', ['$scope', 
function ($scope) {
  	$scope.currentNavItem = 'page1';
  	$scope.goto=function(page){
  		console.log('Goto' + page);
  	};
}])

.controller('toggleMenu', ['$rootScope', 
function ($rootScope) {
  	$rootScope.toggledMenu = function() {
    	$rootScope.isCollapsed = !$rootScope.isCollapsed;
  	};  
}])

.controller('asideMenu', ['$scope','$aside','security',
function($scope, $aside, security) {

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
			templateUrl: 'app/nav-bar-mobile.html',
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
				$scope.logout = function(){
					$scope.ok();
					security.logout();
				};
			}]
		}).result.then(postClose, postClose);
	};
}]);


