'use strict';

// var _ = require('lodash');

var angular= require('angular');
// ECMA 5 - using nodes require() method
var agGrid = require('ag-grid');
// get ag-Grid to create an Angular module and register the ag-Grid directive
agGrid.initialiseAgGridWithAngular1(angular);

require('angular').module('appOperations', [
	'agGrid'
])
.config(['$stateProvider', function($stateProvider)
{
	$stateProvider.state('operations', {
		url:'/operations',
		template: '<ui-view/>',
		authRequired: true,
		redirectTo: 'operations.drivers'
	})

	.state('operations.drivers', {
		url:'/operations/drivers',
		templateUrl: 'app/operations/drivers-time-sheet.html',
		authRequired: true,
		resolve: {
			driversAndOps: ['operationService', 'resourceService', function (operationService) {
				return operationService.findDriversAndOperations();
			}],
			timeEntries: ['operationService', function (operationService) {
				return operationService.findAll()
					.then(function (result) {
						// console.log(JSON.stringify(result));
						return operationService.mapTimeEntryData(result);
					});
			}]
		},
		controller: require('./drivers-time-sheet-controller')
	});
}]);