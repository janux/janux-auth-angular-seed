'use strict';

module.exports = [
	'$scope', '$state','suppliers', function ($scope, $state, suppliers) {

		$scope.editClient = function (id) {
			$state.go('supplier.edit', {id: id, tab: 'supplier'});
		};

		$scope.init = function () {
			$scope.suppliersList = suppliers;
		};

		$scope.init();
	}];