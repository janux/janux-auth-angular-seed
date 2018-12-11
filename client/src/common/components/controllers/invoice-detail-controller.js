'use strict';

var _ = require('lodash');

module.exports =
	['$scope', '$modal', 'invoiceService', '$state', '$timeout', '$filter', '$rootScope', 'config', '$log', function (
		$scope, $modal, invoiceService, $state, $timeout, $filter, $rootScope, config, $log) {

		// Remember. The invoice information is located at $scope.invoice.
		$scope.editModeInvoiceDetail = false;


		//This event is captured, when the information of the selected invoice changes.
		$rootScope.$on(config.invoice.events.invoiceDetailUpdated, function (event, invoice) {
			$scope.invoice = invoice;
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
			if ($scope.invoice.status !== config.invoice.status.ended) {
				$scope.editModeInvoiceDetail = true;
			}
		});
		$scope.$on(config.invoice.events.invoiceEditModeDisabled, function () {
			$scope.editModeInvoiceDetail = false;
		});
		$scope.$on(config.invoice.events.invoicePersonsUpdated, function (event, personsGridHeight) {
			$scope.personsGridHeight = personsGridHeight;
			//console.log("Height:", $scope.personsGridHeight);
		});
		$scope.$on(config.invoice.events.invoiceVehiclesUpdated, function (event, vehiclesGridHeight) {
			$scope.vehiclesGridHeight = vehiclesGridHeight;
			//console.log("Height:", $scope.personsGridHeight);
		});
		$scope.$on(config.invoice.events.invoiceExpensesUpdated, function (event, expensesGridHeight) {
			$scope.expensesGridHeight = expensesGridHeight;
			console.log("Height Expenses:", $scope.expensesGridHeight);
		});

	}];
