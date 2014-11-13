'use strict';


require('angular')
	.module('security', [])
	.factory('security',       require('./security-factory.js'))
	.directive('loginToolbar', require('./login/toolbar.js'))
