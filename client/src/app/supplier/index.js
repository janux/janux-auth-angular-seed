'use strict';

require('common/demoService');
var _ = require('lodash');

require('angular').module('appSupplier', [
	'demoService'
])

	.config(['$stateProvider', function ($stateProvider) {
		// List of supplier
		$stateProvider.state('supplier', {
			url         : '/supplier',
			template    : '<ui-view/>',
			authRequired: true,
			redirectTo  : 'supplier.list'
		})
			.state('supplier.list', {
				url         : '/supplier-list',
				templateUrl : 'app/supplier/index.html',
				authRequired: true,
				controller  : require('./supplier-controller.js'),
				resolve     : {
					suppliers: ['partyService', 'security', 'userService', function (partyService, security, userService) {
						var companyInfo;
						return userService.findCompanyInfo(security.currentUser.username)
							.then(function (result) {
								companyInfo = result;
								return partyService.findOrganizationByIsSupplier(true);
							})
							.then(function (result) {
								return _.filter(result, function (o) {
									return o.id !== companyInfo.id;
								});
							})
							.then(function (result) {
								console.log('Supplier list', result);
								var parties = _.map(result, function (o) {

									var address = '';

									if(_.isArray(o.contactMethods.addresses) &&  o.contactMethods.addresses.length>0 ){
										address= o.contactMethods.addresses[0].line1;
									}else{
										address= '';
									}

									o.supplierDisplayAddress = address;
									return o;

								});
								return parties;

							});
					}]
				}
			})

			// Create supplier
			.state('supplier.create', {
				url         : '/supplier-create',
				templateUrl : 'app/supplier/create-supplier.html',
				authRequired: true,
				controller  : require('./supplier-create-controller.js'),
				resolve     : {}
			})

			// Edit specific supplier
			.state('supplier.edit', {
				url         : '/edit/{id}/{tab}',
				templateUrl : 'app/supplier/edit-supplier.html',
				authRequired: true,
				controller  : require('./edit-supplier-controller.js'),
				resolve     : {
					supplier           : ['partyService', '$stateParams', function (partyService, $stateParams) {
						return partyService.findOne($stateParams.id);
					}],
					supplierGroup      : ['supplier', 'partyGroupService', function (supplier, partyGroupService) {
						return partyGroupService.findOneOwnedByPartyAndType(supplier.id, 'COMPANY_CONTACTS', true);
					}],
					assignableResources: ['supplier', 'resourceService', function (supplier, resourceService) {
						return resourceService.findAvailableResourcesByVendor(supplier.id);
					}]

				}
			});

	}]);