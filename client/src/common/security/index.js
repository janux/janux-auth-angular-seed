'use strict';

require('angular-bootstrap');

require('angular').module('jnxSecurity', ['ui.bootstrap'])
	.factory(   'security',             require('./security-service.js'))
	.factory(   'retryQueue',           require('./retry-queue.js'))
	.provider(  '$jnxAuth',             require('./auth-provider.js'))
	.factory(   'authFailureIntercept', require('./auth-failure-intercept.js'))
	.directive( 'loginToolbar',         require('./login/toolbar.js'))
	.controller('loginController',      require('./login/login-controller.js'))

	.config(['$httpProvider', function($httpProvider) {
		// We have to add the interceptor to the queue as a string because the interceptor 
		// depends upon service instances that are not available in the config block.
		$httpProvider.responseInterceptors.push('authFailureIntercept');
	}]);
