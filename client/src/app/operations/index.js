'use strict';

// var _ = require('lodash');

var angular= require('angular');
// ECMA 5 - using nodes require() method
var agGrid = require('ag-grid');
// get ag-Grid to create an Angular module and register the ag-Grid directive
agGrid.initialiseAgGridWithAngular1(angular);
var timePeriods = require('common/time-periods');

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
			driversAndOps: ['operationService', function (operationService) {
				return operationService.findDriversAndOperations();
			}],
			timeEntries: ['operationService','jnxStorage', function (operationService,jnxStorage) {
				var storedFilterPeriod = jnxStorage.findItem('driversTimeLogFilterPeriod', true);
				var periodKey = (storedFilterPeriod)?storedFilterPeriod:'last7Days';
				var period = timePeriods[periodKey];

				return operationService.findByDateBetweenWithTimeEntries(period.from(), period.to())
					.then(function (result) {
						// console.log(JSON.stringify(result));
						return operationService.mapTimeEntryData(result);
					});
			}]
		},
		controller: require('./drivers-time-sheet-controller')
	})

	.state('operations.guards', {
		url:'/operations/guards',
		templateUrl: 'app/operations/guards-time-sheet.html',
		authRequired: true,
		resolve: {
			driversAndOps: ['operationService', function (operationService) {
				return operationService.findDriversAndOperations();
			}],
			timeEntries: ['operationService','jnxStorage', function (operationService,jnxStorage) {
				var storedFilterPeriod = jnxStorage.findItem('driversTimeLogFilterPeriod', true);
				var periodKey = (storedFilterPeriod)?storedFilterPeriod:'last7Days';
				var period = timePeriods[periodKey];

				return operationService.findByDateBetweenWithTimeEntries(period.from(), period.to())
					.then(function (result) {
						// console.log(JSON.stringify(result));
						return operationService.mapTimeEntryData(result);
					});
			}]
		},
		controller: require('./guards-time-sheet-controller')
	});
}]);