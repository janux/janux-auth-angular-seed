'use strict';


module.exports =
	['$scope', '$modal', 'invoiceService', '$state', '$timeout', '$filter', '$rootScope', 'config', function (
		$scope, $modal, invoiceService, $state, $timeout, $filter, $rootScope, config) {

		// Remember. The invoice information is located at $scope.invoice.
		$scope.subTotalPerson = 0;
		$scope.subTotalVehicle = 0;
		$scope.subTotalExpense = 0;

		function calculateSubtotals() {

			var subTotalPerson = 0;
			var subTotalVehicle = 0;
			var subTotalExpense = 0;

			for (var i = 0; i < $scope.invoice.items.length; i++) {
				var item = $scope.invoice.items[i];
				var itemTimeEntries = item.timeEntries;
				subTotalExpense = _.sumBy(item.expenses, function (o) {
					return o.cost;
				});
				for (var j = 0; j < itemTimeEntries.length; j++) {
					var itemTimeEntry = itemTimeEntries[j];
					if (!_.isNil(itemTimeEntry.parameters)) {
						subTotalPerson += (_.isNil(itemTimeEntry.parameters.ratePerson) ? 0 : itemTimeEntry.parameters.ratePerson.totalAfterDiscount);
						subTotalVehicle += (_.isNil(itemTimeEntry.parameters.rateVehicle) ? 0 : itemTimeEntry.parameters.rateVehicle.totalAfterDiscount);
					}
				}
			}

			$scope.subTotalPerson = subTotalPerson;
			$scope.subTotalVehicle = subTotalVehicle;
			$scope.subTotalExpense = subTotalExpense;

			//This event is captured, when the information of the selected invoice changes.
			$rootScope.$on(config.invoice.events.invoiceDetailUpdated, function () {
				calculateSubtotals();
			});

		}
	}];