'use strict';

var _ = require('lodash');

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
			clientsList:['partyService',function(partyService){
				return partyService.findOrganizationByIsSupplier(false)
				.then(function (result) {
					console.log('Client list', result);
					var parties = _.map(result, function (o) {

						var address = '';

						if(_.isArray(o.contactMethods.addresses) &&  o.contactMethods.addresses.length>0 ){
							address= o.contactMethods.addresses[0].line1;
						}else{
							address= '';
						}

						o.clientDisplayAddress = address;
						return o;

					});
					return parties;

				});
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
				// console.log('Id Parametro:',$stateParams.id);
				return partyService.findOne($stateParams.id);
			}],
			clientGroup: ['client','partyGroupService',function (client,partyGroupService) {
				return partyGroupService.findOneOwnedByPartyAndType(client.id, 'COMPANY_CONTACTS', true);
			}],
			rateMatrix: ['client','rateMatrixService',function (client,rateMatrixService) {
				return rateMatrixService.findOrInsertDefaultRateMatrix(client.id);
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
		url: '/client/{id}',
		templateUrl: 'app/client/edit-client.html',
		authRequired: true,
		controller: require('./edit-client-controller.js'),
		resolve: {
			client: ['partyService', '$stateParams', function(partyService, $stateParams){
				return partyService.findOne($stateParams.id);
			}]
		}
	});

}]);