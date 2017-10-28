'use strict';

var angular= require('angular');
// ECMA 5 - using nodes require() method
var agGrid = require('ag-grid');
// get ag-Grid to create an Angular module and register the ag-Grid directive
agGrid.initialiseAgGridWithAngular1(angular);

require('angular').module('appDriverLogbook', [
	'agGrid'
])
.config(['$stateProvider', function($stateProvider)
{
	$stateProvider.state('driver-logbook', {
		url:'/driver-logbook',
		templateUrl: 'app/driver-logbook/index.html',
		authRequired: true,
		resolve: {},
		controller: require('./logbook-controller')
	});
}]);