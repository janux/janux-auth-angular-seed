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
					console.log('Operations before mapping', operations);
					return operationService.mapOperations(operations);
				});
			}]
		}
	})

	// // Create Service
	// .state('services.create', {
	// 	url: '/services-create',
	// 	templateUrl: 'app/services/create-services.html',
	// 	authRequired: true,
	// 	controller: require('./services-create-controller.js'),
	// 	resolve: {}
	// })

	// Edit Service
	.state('services.edit', {
		url: '/services-edit/{id}',
		templateUrl: 'app/services/edit-operation.html',
		authRequired: true,
		// controller: require('./edit-service-controller.js'),
		resolve: {}
	});
}]);