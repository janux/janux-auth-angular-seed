'use strict';

// var  _ = require('lodash');

require('common/demoService');

require('angular').module('appServices', [
	'demoService'
])
.config(['$stateProvider', function($stateProvider)
{
	$stateProvider.state('services', {
		url: '/services',
		template: '<ui-view/>',
		authRequired: true,
		redirectTo: 'services.list'
	})
	.state('services.list', {
		url: '/services-list',
		templateUrl: 'app/services/index.html',
		authRequired: true,
		controller: require('./services-controller.js'),
		resolve: {
			operations: ['operationService', function (operationService) {
				return operationService.findAllWithoutTimeEntry().then(function (operations) {
					// console.log('Operations before mapping', operations);
					return operationService.mapOperations(operations);
				});
			}]
		}
	})

	// Create Service
	.state('services.create-special', {
		url: '/services-create-special',
		templateUrl: 'app/services/create-operation.html',
		authRequired: true,
		controller: require('./create-special-controller.js'),
		resolve: {
			clientsList: ['partyService',function (partyService) {
				return partyService.findOrganizations();
			}]
		}
	})

	// Edit Service
	.state('services.view-special', {
		url: '/services-view-special/{id}',
		templateUrl: 'app/services/view-operation.html',
		authRequired: true,
		controller: require('./view-special-controller.js'),
		resolve: {
			clientsList: ['partyService',function (partyService) {
				return partyService.findOrganizations();
			}],
			operation: ['operationService','$stateParams', function (operationService, $stateParams) {
				return operationService.findById($stateParams.id);
			}]
		}
	});
}]);