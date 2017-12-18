'use strict';

var _ = require('lodash');

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
			driversAndOps: ['operationService', 'resourceService', function (operationService, resourceService) {
				return operationService.findAllWithoutTimeEntry().then(function(result) {

					// TODO: Move this logic to operation service method
					var driversAssignedToOperations = [];
					var operations = [];
					result.forEach(function (op) {
						var tmpRes = _.filter(op.currentResources, {type:'DRIVER'});

						// If the operation has at least one driver
						if( tmpRes.length > 0 ) {
							tmpRes.forEach(function(res, resId) {
								tmpRes[resId].opId = op.id;
							});

							var opWithOutRes = _.clone(op);
							delete opWithOutRes.currentResources;
							driversAssignedToOperations = driversAssignedToOperations.concat(tmpRes);
							operations = operations.concat(opWithOutRes);
						}
					});

					return resourceService.findAvailableResources().then(function (result) {

						// Filter only drivers.
						result = _.filter(result, function (o) {
							return o.type === 'DRIVER';
						});

						return {
							driversAssignedToOperations : driversAssignedToOperations,
							drivers : result,
							operations : operations
						};
					});
				});
			}]
		},
		controller: require('./drivers-time-sheet-controller')
	});
}]);