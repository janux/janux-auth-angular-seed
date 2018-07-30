'use strict';


module.exports =
	['$scope', '$modal', 'invoiceService', '$state', '$timeout', '$filter', '$rootScope', 'config', '$log', function (
		$scope, $modal, invoiceService, $state, $timeout, $filter, $rootScope, config, $log) {

		// Remember. The invoice information is located at $scope.invoice.
		$scope.subTotalPerson = 0;
		$scope.subTotalVehicle = 0;
		$scope.subTotalExpense = 0;
		$scope.editModeInvoiceDetail = false;


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
						subTotalPerson += (_.isNil(itemTimeEntry.parameters.ratePerson) || itemTimeEntry.doNotInvoice === true ? 0 : itemTimeEntry.parameters.ratePerson.totalAfterDiscount);
						subTotalVehicle += (_.isNil(itemTimeEntry.parameters.rateVehicle) || itemTimeEntry.doNotInvoiceVehicle === true ? 0 : itemTimeEntry.parameters.rateVehicle.totalAfterDiscount);
					}
				}
			}

			$scope.subTotalPerson = subTotalPerson;
			$scope.subTotalVehicle = subTotalVehicle;
			$scope.subTotalExpense = subTotalExpense;

		}

		//This event is captured, when the information of the selected invoice changes.
		$rootScope.$on(config.invoice.events.invoiceDetailUpdated, function (event, invoice) {
			$scope.invoice = invoice;
			calculateSubtotals();
		});

		$scope.$on('agGridDoNotInvoicePersonChange', function (event, value) {
			// console.log("Cached event agGridDoNotInvoicePersonChange with " + JSON.stringify(value));
			var updatedValue = value.updatedValue;
			var timeEntry = value.timeEntry;
			var invoiceItemTe = getItemTimeEntry(timeEntry);
			if (!_.isNil(invoiceItemTe)) {
				invoiceItemTe.doNotInvoice = updatedValue;
				invoiceService.updateInvoiceItemTimeEntry(invoiceItemTe)
					.then(function () {
						// Send an event that updates the invoice information in the ui.
						$rootScope.$broadcast(config.invoice.events.invoiceDetailSelected, $scope.invoice.invoiceNumber);
					});
			} else {
				$log.error("Error finding invoiceItemTimeEntry " + JSON.stringify(value));
			}
		});

		$scope.$on('agGridDoNotInvoiceVehicleChange', function (event, value) {
			// console.log("Cached event agGridDoNotInvoiceVehicleChange with " + JSON.stringify(value));
			var updatedValue = value.updatedValue;
			var timeEntry = value.timeEntry;
			var invoiceItemTe = getItemTimeEntry(timeEntry);
			if (!_.isNil(invoiceItemTe)) {
				invoiceItemTe.doNotInvoiceVehicle = updatedValue;
				invoiceService.updateInvoiceItemTimeEntry(invoiceItemTe)
					.then(function () {
						// Send an event that updates the invoice information in the ui.
						$rootScope.$broadcast(config.invoice.events.invoiceDetailSelected, $scope.invoice.invoiceNumber);
					});
			} else {
				$log.error("Error finding invoiceItemTimeEntry " + JSON.stringify(value));
			}
		});

		function getItemTimeEntry(timeEntry) {
			var invoiceItemTe = null;
			// Get the itemTimeEntry.
			for (var i = 0; i < $scope.invoice.items.length && _.isNil(invoiceItemTe); i++) {
				var item = $scope.invoice.items[i];
				invoiceItemTe = _.find(item.timeEntries, function (o) {
					return o.timeEntry.id === timeEntry.id;
				});
			}
			return invoiceItemTe;
		}

		$scope.$on(config.invoice.events.invoiceEditModeEnabled, function () {
			$scope.editModeInvoiceDetail = true;
		});
		$scope.$on(config.invoice.events.invoiceEditModeDisabled, function () {
			$scope.editModeInvoiceDetail = false;
		});

	}];
