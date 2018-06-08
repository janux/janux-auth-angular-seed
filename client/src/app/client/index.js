'use strict';

require('common/demoService');

require('angular').module('appClient', [
	'demoService'
])

.config(['$stateProvider', function($stateProvider)
{
	// List of client
	$stateProvider.state('client', {
		url:'/client',
		template: '<ui-view/>',
		authRequired: true,
		redirectTo: 'client.list'
	})
	.state('client.list', {
		url: '/client-list',
		templateUrl: 'app/client/index.html',
		authRequired: true,
		controller: require('./client-controller.js'),
		resolve: {
			clientsList:['clientService',function(clientService){
				return clientService.findAll();
			}]
		}
	})

	// Create Client
	.state('client.create', {
		url: '/client-create',
		templateUrl: 'app/client/create-client.html',
		authRequired: true,
		controller: require('./client-create-controller.js'),
		resolve: {}
	})

	// Edit specific client
	.state('client.edit', {
		url: '/edit/{id}/{tab}',
		templateUrl: 'app/client/edit-client.html',
		authRequired: true,
		controller: require('./edit-client-controller.js'),
		resolve: {
			client: ['partyService', '$stateParams', function(partyService, $stateParams){
				return partyService.findOne($stateParams.id);
			}],
			clientGroup: ['client','partyGroupService',function (client,partyGroupService) {
				return partyGroupService.findOneOwnedByPartyAndType(client.id, 'COMPANY_CONTACTS', true);
			}],
			rateMatrix: ['client','rateMatrixService',function (client,rateMatrixService) {
				return rateMatrixService.findOrInsertDefaultRateMatrix(client.id);
			}]
		}
	});

}]);