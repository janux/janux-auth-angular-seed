'use strict';

var _ = require('lodash');

module.exports = [
	'$scope', '$state', 'partyService', function ($scope, $state, partyService) {

		$scope.editClient = function (id) {
			$state.go('supplier.edit', {id: id, tab: 'supplier'});
		};

		$scope.init = function () {
			partyService.findOrganizationByIsSupplier(true)
				.then(function (result) {
					// Remove glarus. TODO: Remove the hard coded line.

					$scope.suppliersList = _.filter(result, function (o) {
						return o.id !== '10000';
					});
					console.log('Client:', result);
				});
		};

		$scope.init();


	}];