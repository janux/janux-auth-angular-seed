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
				return operationService.findWithoutTimeEntryByAuthenticatedUser().then(function (operations) {
					console.log('Operations before mapping', operations);
					return operationService.mapOperations(operations);
				});
			}],
			invoices : ['invoiceService', 'security', function (invoiceService, security) {
				return invoiceService.findByUserName(security.currentUser.username).then( function (invoices) {
					// console.log('Operations before mapping', operations);
					return invoices;
				});
			}]
		}
	})

	// Create special service
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

	// Create research service
	.state('services.create-research', {
		url: '/services-create-research',
		templateUrl: 'app/services/create-operation-consulting.html',
		authRequired: true,
		controller: require('./create-operation-research-consulting'),
		resolve: {
			clientsList: ['partyService',function (partyService) {
				return partyService.findOrganizations();
			}]
		}
	})

	// Edit special service
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
			}],
			driversAndOps: ['operationService', function (operationService) {
				return operationService.findDriversAndSpecialOps();
			}],
			invoices: ['invoiceService', '$stateParams', function (invoiceService, $stateParams) {
				return invoiceService.findByIdOperation($stateParams.id);
			}]
		}
	})

	//Edit research service.
	.state('services.view-consulting', {
		url: '/services-view-consulting/{id}',
		templateUrl: 'app/services/view-operation.html',
		authRequired: true,
		controller: require('./view-special-controller.js'),
		resolve: {
			clientsList: ['partyService',function (partyService) {
				return partyService.findOrganizations();
			}],
			operation: ['operationService','$stateParams', function (operationService, $stateParams) {
				return operationService.findById($stateParams.id);
			}],
			driversAndOps: ['operationService', function (operationService) {
				return operationService.findDriversAndSpecialOps();
			}],
			invoices: ['invoiceService', '$stateParams', function (invoiceService, $stateParams) {
				return invoiceService.findByIdOperation($stateParams.id);
			}]
		}
	});
}]);
