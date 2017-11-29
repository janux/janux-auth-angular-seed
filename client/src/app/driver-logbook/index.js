'use strict';

var _ = require('lodash');

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
		resolve: {
			driversAndOps: ['operationService', function (operationService) {
				return operationService.findAllWithoutTimeEntry().then(function(ops) {
					var drivers = [];
					var operations = [];
					ops.forEach(function (op) {
						var tmpRes = _.filter(op.currentResources, {type:'DRIVER'});

						// If the operation has at least one driver
						if( tmpRes.length > 0 ) {
							tmpRes.forEach(function(res, resId) {
								tmpRes[resId].opId = op.id;
							});

							var opWithOutRes = _.clone(op);
							delete opWithOutRes.currentResources;
							drivers = drivers.concat(tmpRes);
							operations = operations.concat(opWithOutRes);
						}
					});

					return {
						drivers: drivers,
						operations: operations
					};
				});
			}]
		},
		controller: require('./logbook-controller')
	});
}]);