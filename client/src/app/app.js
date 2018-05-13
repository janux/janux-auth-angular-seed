'use strict'; 

var angular = require('angular');
var _ = require('lodash');
var moment = require('moment');

require('angular-ui-router');
require('angular-translate');
require('angular-translate-loader-static-files');
require('angular-translate-cookie');
require('angular-cookies');
require('angular-translate-local');
require('angular-aside');
require('angular-material');
require('datetimepicker');
require('angular-animate');
require('angular-aria');
require('angular-local-storage');
require('angular-jwt');
require('angular-sanitize');
require('angular-file-saver');
require('angular-moment');
require('angular-loading-bar');
require('highlight');
require('angular-highlightjs');
require('marked');
require('angular-marked');
require('bootstrap-markdown');
require('angular-markdown-editor');
require('drag-and-drop-lists');
require('drag-drop-mobile');
require('common/config');
require('common/jsonrpc');
require('common/jnxSecurity');
require('common/directives');
require('common/ag-grid-directives');
require('common/demoService');
require('common/components');
require('app/users');
require('app/permissions');
require('app/roles');
require('app/staff');
require('app/operations');
require('app/client');
require('app/supplier');
require('app/services');

angular.module('MyApp',[
	'jsonrpc',
	'ui.router',
	'ngCookies',
	'ngAside',
	'ngMaterial',
	'ngMaterialDatePicker',
	'ngSanitize',
	'jnxSecurity',
	'hc.marked',
	'hljs',
	'angular-markdown-editor',
	'pascalprecht.translate',
	'angular-loading-bar',
	'dndLists',
	'config',
	'LocalStorageModule',
	'commonDirectives',
	'commonComponents',
	'agGridDirectives',
	'demoService',
	'appUsers',
	'appStaff',
	'appPermissions',
	'appRoles',
	'appRoles',
	'angular-jwt',
	'angularMoment',
	'ngFileSaver',
	'appOperations',
	'appClient',
	'appServices',
	'appSupplier'
])

.run([  '$rootScope','$state','$stateParams','security','$anchorScroll','$translate',
function($rootScope , $state , $stateParams , security , $anchorScroll , $translate ) {
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

	$rootScope.$on('AppLogIn', function(event, currentUser) {
		var storedLang = localStorage.getItem(currentUser.username+'-glarusLang');
		if (storedLang) {
			console.info('Using language from profile', storedLang);
			$translate.use(storedLang);
			moment.locale(storedLang);
		}
	});

	// On page reload, check to see whether the user logged in previously
	security.requestCurrentUser();
}])

.config(['$stateProvider','$urlRouterProvider','$locationProvider','$translateProvider','localStorageServiceProvider','markedProvider','hljsServiceProvider','$mdDateLocaleProvider','$mdAriaProvider','$provide','cfpLoadingBarProvider',
function( $stateProvider , $urlRouterProvider , $locationProvider , $translateProvider , localStorageServiceProvider , markedProvider , hljsServiceProvider , $mdDateLocaleProvider , $mdAriaProvider , $provide , cfpLoadingBarProvider ) {

	$translateProvider.useStaticFilesLoader({
		prefix: 'locale/',
		suffix: '.json'
	})
	// This is to make sure that language variations (eg. en_US and en_UK)
	// all map to existing languages, when detecting language from browser below
	.registerAvailableLanguageKeys(['en','es'], {
		'en_*': 'en',
		'es_*': 'es'
	})
	// determine preferred language from browser
	.determinePreferredLanguage()
	.fallbackLanguage('en')
	.useSanitizeValueStrategy('sanitizeParameters')
	.useLocalStorage();

	// Angular loading bar
	cfpLoadingBarProvider.latencyThreshold = 500;

	// redirect from 1st parm to 2nd parm
	$urlRouterProvider.when('/c?id', '/contacts/:id');
	
	// redirect invalid urls to the home page
	$urlRouterProvider.otherwise('/');
	
	// HTML5 History API enabled
	$locationProvider.html5Mode(true);

	localStorageServiceProvider.setPrefix('janux-demo');

	// add additional function to md-autocomplete
	function mdAutoCompleteDirectiveOverride($delegate) {
		var directive = $delegate[0];
		// need to append to base compile function
		var compile = directive.compile;

		// add our custom attribute to the directive's scope
		angular.extend(directive.scope, {
			menuContainerClass: '@?mdMenuContainerClass'
		});

		// recompile directive and add our class to the virtual repeat container
		directive.compile = function(element, attr) {
			var template = compile.apply(this, arguments);
			var menuContainerClass = attr.mdMenuContainerClass ? attr.mdMenuContainerClass : '';
			var menuContainer = element.find('md-virtual-repeat-container');

			menuContainer.addClass(menuContainerClass);

			// recompile the template
			return function() {
				template.apply(this, arguments);
			};
		};

		return $delegate;
	}

	$provide.decorator('mdAutocompleteDirective', mdAutoCompleteDirectiveOverride);
	mdAutoCompleteDirectiveOverride.$inject = ['$delegate'];

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

	// marked config
	// markedProvider.setOptions({
	// 	gfm: true,
	// 	tables: true,
	// 	sanitize: true,
	// 	highlight: function (code, lang) {
	// 		if (lang) {
	// 			return hljs.highlight(lang, code, true).value;
	// 		} else {
	// 			return hljs.highlightAuto(code).value;
	// 		}
	// 	}
	// });

	// highlight config
	hljsServiceProvider.setOptions({
		// replace tab with 4 spaces
		tabReplace: '    '
	});

	$mdDateLocaleProvider.formatDate = function(date) {
		if (!date) {return '';}
		else{
			return moment(date).format('YYYY-MM-DD');
		}

	};
	$mdDateLocaleProvider.parseDate = function(dateString) {
		var m = moment(dateString, 'YYYY-MM-DD', true);
		return m.isValid() ? m.toDate() : new Date(NaN);
	};

	// Globally disables all ARIA warnings.
	$mdAriaProvider.disableWarnings();
}])


.controller('sidebarCtrl', ['$rootScope', 'config',
function ($rootScope, config) {

	$rootScope.$on('currentUserCached', function(event, currentUser) {
		var userRole = currentUser.roles[0];
		// console.log('Time entry Driver:',userRole.can('READ','TIME_ENTRY_DRIVER'));
		$rootScope.userRole = userRole;

		$rootScope.showOption = function(option){
		var show = false;
		_.map(option.subOptions,function(subOption){
				if(userRole.can('READ',subOption.authContext)){
					show = true;
				}
			});	
		return show;
		};
	});
	
	$rootScope.noneStyle = true;
	$rootScope.bodyCon = false;
	$rootScope.subMenu = [];
	$rootScope.toggleSubmenu = [];
	$rootScope.subMenuFlag = [];
	$rootScope.mainMenu = config.mainMenu;

	var options = _.map(config.mainMenu,'key');

	// All submenus hidden
	$rootScope.resetSubmenu = function () {
		options.forEach(function(anOpt){
			$rootScope.subMenu[anOpt] = false;
		});
	};

	$rootScope.menuHasSubOptions = function (menu) {
		return (Object.keys(menu.subOptions).length>0);
	};

	options.forEach(function(opt){
		// Initialize
		$rootScope.subMenu[opt] = false;

		// Toogle submenu
		$rootScope.toggleSubmenu[opt] = function () {
			$rootScope.subMenuFlag[opt] = !$rootScope.subMenuFlag[opt];
			options.forEach(function(anOpt){
				$rootScope.subMenu[anOpt] = (anOpt===opt);
			});
		};
	});
    
	//Toggle the styles
	$rootScope.toggleStyle = function () {
		//If they are true, they will become false 
		//and false will become true
		$rootScope.bodyCon = !$rootScope.bodyCon;
		$rootScope.noneStyle = !$rootScope.noneStyle;
		$rootScope.$broadcast('sideMenuSizeChange');
	};
	//add class to search box
	$rootScope.openSearch = false;
	$rootScope.searchToggle = function () {
    	$rootScope.openSearch = !$rootScope.openSearch;
	};
}])


.controller('asideMenu', ['$scope','$aside','security','$translate','jnxStorage',
function($scope, $aside, security, $translate, jnxStorage) {

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

	$scope.toggleLang = function (langToSet) {
		$translate.use(langToSet);
		moment.locale(langToSet);
		jnxStorage.setItem('glarusLang',langToSet, true);
	};
}]);


