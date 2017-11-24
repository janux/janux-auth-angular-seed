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
			operations: ['operationService', function (operationService) {
				return operationService.findAllWithoutTimeEntry().then(function(ops){
					var out = [], inx = 0;
					ops.forEach(function (op) {
						op.currentResources = _.filter(op.currentResources, {type:'DRIVER'});

						if( op.currentResources.length > 0 ) {
							out[inx] = op;
						}
						inx++;
					});
					return out;
				});
			}]
		},
		controller: require('./logbook-controller')
	});
}]);