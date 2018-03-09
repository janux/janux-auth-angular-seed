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

				return operationService.findWithTimeEntriesByDateBetweenAndType(period.from(), period.to(),'DRIVER')
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
				return operationService.findGuardsAndOperations();
			}],
			timeEntries: ['operationService','jnxStorage', function (operationService,jnxStorage) {
				var storedFilterPeriod = jnxStorage.findItem('guardsTimeLogFilterPeriod', true);
				var periodKey = (storedFilterPeriod)?storedFilterPeriod:'last7Days';
				var period = timePeriods[periodKey];

				return operationService.findWithTimeEntriesByDateBetweenAndType(period.from(), period.to(),'GUARD')
					.then(function (result) {
						// console.log(JSON.stringify(result));
						return operationService.mapTimeEntryData(result);
					});
			}]
		},
		controller: require('./guards-time-sheet-controller')
	})

	.state('operations.specials', {
		url:'/operations/specials',
		templateUrl: 'app/operations/special-ops-time-sheet.html',
		authRequired: true,
		resolve: {
			driversAndOps: ['operationService', function (operationService) {
				return operationService.findDriversAndSpecialOps();
			}],
			timeEntries: ['operationService','jnxStorage', function (operationService,jnxStorage) {
				var storedFilterPeriod = jnxStorage.findItem('specialOpsTimeLogFilterPeriod', true);
				var periodKey = (storedFilterPeriod)?storedFilterPeriod:'last7Days';
				var period = timePeriods[periodKey];

				return operationService.findWithTimeEntriesByDateBetweenAndType(period.from(), period.to(),'SPECIAL_OPS')
					.then(function (result) {
						// console.log(JSON.stringify(result));
						return operationService.mapTimeEntryData(result);
					});
			}]
		},
		controller: require('./special-ops-time-sheet-controller')
	})

	.state('operations.attendance', {
		url:'/operations/attendance',
		templateUrl: 'app/operations/attendance-time-sheet.html',
		authRequired: true,
		resolve: {
			driversAndOps: ['operationService', function (operationService) {
				return operationService.findStaffAndOperationAttendance();
			}],
			timeEntries: ['operationService','jnxStorage', function (operationService,jnxStorage) {
				var storedFilterPeriod = jnxStorage.findItem('attendanceTimeLogFilterPeriod', true);
				var periodKey = (storedFilterPeriod)?storedFilterPeriod:'last7Days';
				var period = timePeriods[periodKey];
				return operationService.findWithTimeEntriesByDateBetweenAndType(period.from(), period.to(), undefined)
					.then(function (result) {
						return operationService.mapTimeEntryData(result);
					});
			}]
		},
		controller: require('./attendance-time-sheet-controller')
	});
}]);