'use strict';

require('angular').module('demoService', [])

	.factory('userService', require('./user-service.js'))
	.run(function() {
		console.log('janux auth seed correctly instantiated services');
	});