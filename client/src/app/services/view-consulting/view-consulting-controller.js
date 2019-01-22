'use strict';

var moment = require('moment');
var _ = require('lodash');
// var agGridComp = require('common/ag-grid-components');


module.exports =
	['$scope', '$rootScope', 'clientsList', '$state', '$stateParams', 'config', 'operationService', 'invoiceService', 'operation', '$modal', '$filter', 'localStorageService', '$timeout', 'nameQueryService', 'jnxStorage', 'invoices', 'dialogService', function (
		$scope, $rootScope, clientsList, $state, $stateParams, config, operationService, invoiceService, operation, $modal, $filter, localStorageService, $timeout, nameQueryService, jnxStorage, invoices, dialogService) {

		console.debug('Operation', operation);

		var storedTab = jnxStorage.findItem('consultingViewSelectedTab', true);

		$scope.cl = clientsList;
		$scope.editMode = false;
		$scope.currentNavItem = (storedTab) ? storedTab : 'summary';
		$scope.editModeInvoiceDetail = false;
		$scope.operationId = $stateParams.id;
		$scope.invoices = invoices;
		$scope.invoice = undefined;

		// console.debug('Invoices', invoices);

		$scope.currentNavItem = (storedTab) ? storedTab : 'summary';
		$scope.operationId = $stateParams.id;


		$scope.changeTab = function (tab) {
			$scope.currentNavItem = tab;
			if (tab !== 'invoiceDetail') {
				jnxStorage.setItem('consultingViewSelectedTab', $scope.currentNavItem, true);
			}

		};

		var updateInvoiceList = function () {
			invoiceService.findByIdOperation($stateParams.id)
				.then(function (result) {
					$scope.invoices = result;
					$rootScope.$broadcast(config.invoice.events.invoiceListUpdated, result);
					if ($scope.editModeInvoiceDetail) {
						$rootScope.$broadcast(config.invoice.events.invoiceEditModeEnabled, $scope.invoice);
					}
				});
		};

		var mapOperationToEditable = function (operation) {
			operation.client = {object: operation.client, search: ''};
			operation.interestedParty = {object: operation.interestedParty, search: ''};
			operation.principals = (operation.principals.length > 0) ? _.map(operation.principals, function (principal) {
				return {object: principal, search: ''};
			}) : [{object: null, search: ''}];

			// Filter Vehicles
			operation.vehicles = _.filter(operation.resources, {type: 'VEHICLE'});
			operation.vehicles = (operation.vehicles.length > 0) ? _.map(operation.vehicles, function (vehicle) {
				return {object: vehicle, search: ''};
			}) : [{object: null, search: ''}];

			// Filter staff
			operation.staff = _.filter(operation.resources, function (resource) {
				return (resource.type !== 'VEHICLE');
			});
			operation.staff = (operation.staff.length > 0) ? _.map(operation.staff, function (staff) {
				return {object: staff, search: ''};
			}) : [{object: null, search: ''}];

			return operation;
		};

		$scope.data = mapOperationToEditable(operation);
		console.debug('editable operation', $scope.data);

		// Update operation
		$scope.save = function () {
			// Process operation to insert
			var operation = _.clone($scope.data);

			// Validate operation
			if (operation.name === '') {
				dialogService.info('services.specialForm.dialogs.nameEmpty');
				return;
			} else if (!_.isDate(operation.begin)) {
				dialogService.info('services.specialForm.dialogs.startEmpty');
				return;
			} else if (_.isDate(operation.end)) {
				if (operation.begin > operation.end) {
					dialogService.info('operations.dialogs.endDateError');
					return;
				}
			} else if (_.isNil(operation.client.object)) {
				dialogService.info('services.specialForm.dialogs.clientEmpty');
				return;
			}

			operation.client = operation.client.object;
			operation.interestedParty = operation.interestedParty.object;
			operation.principals = _.chain(operation.principals)
				.map('object')
				.filter(function (principal) {
					return (!_.isNil(principal));
				})
				.value();

			var resources = [];

			var staff = _.chain(operation.staff)
				.filter(function (staff) {
					return (!_.isNil(staff.object));
				})
				.map(function (staff) {
					delete staff.object.id;
					return staff.object;
				})
				.value();

			resources = resources.concat(staff);

			var vehicles = _.chain(operation.vehicles)
				.filter(function (vehicle) {
					return (!_.isNil(vehicle.object));
				})
				.map(function (vehicle) {
					delete vehicle.object.id;
					return vehicle.object;
				})
				.value();

			resources = resources.concat(vehicles);

			operation.resources = resources;
			operation.begin = moment(operation.begin).toDate();
			operation.end = (!_.isNil(operation.end)) ? moment(operation.end).toDate() : null;

			delete operation.staff;
			delete operation.vehicles;

			console.debug('Operation to update', operation);

			operationService.update(operation).then(function (result) {
				console.debug('Updated operation', result);
				//$state.go('services.consulting');
				$scope.editMode = false;
			});
		};

		// Return to operations list
		$scope.cancel = function () {
			$state.go('services.consulting');
		};

		$scope.enableEditModeInvoiceDetail = function () {
			$scope.editModeInvoiceDetail = true;
			$scope.$broadcast(config.invoice.events.invoiceEditModeEnabled, $scope.invoice);
		};

		$scope.disableEditModeInvoiceDetail = function () {
			$scope.editModeInvoiceDetail = false;
			$scope.$broadcast(config.invoice.events.invoiceEditModeDisabled);
		};

		$scope.cancelInvoiceDetail = function () {
			$scope.editModeInvoiceDetail = false;
			$scope.changeTab('invoices');
			$scope.$broadcast(config.invoice.events.invoiceEditModeDisabled);
		};


		// We need to reload because when the language changes ag-grid doesn't reload by itself
		// $rootScope.$on('$translateChangeSuccess', function () {
		// 	console.debug('$translateChangeSuccess');
		// 	$state.reload();
		// });

		/**
		 * This event is called when ..
		 * An invoice is selected for showing details.
		 * The selected invoice has been updated.
		 * @param invoiceNumber
		 */
		var updatedSelectedInvoice = function (invoiceNumber) {
			invoiceService.findOne(invoiceNumber)
				.then(function (result) {
					$scope.invoice = result;
					$rootScope.$broadcast(config.invoice.events.invoiceDetailUpdated, result);
				});
		};

		$scope.updateInvoiceHeader = function () {
			// console.debug(' inv update ' + JSON.stringify($scope.invoice));
			// Validate if percentage is greater then zero.
			if (_.isNumber($scope.invoice.discountPersonPercentage) === false || $scope.invoice.discountPersonPercentage < 0 || $scope.invoice.discountPersonPercentage > 100) {
				dialogService.info('services.invoice.dialogs.invalidPercentage');
			} else {
				invoiceService.update($scope.invoice)
					.then(function () {
						updatedSelectedInvoice($scope.invoice.invoiceNumber);
						$scope.disableEditModeInvoiceDetail();
					});
			}
		};

		$scope.openAddToInvoiceMenu = function ($mdMenu, ev) {
			$mdMenu.open(ev);
		};


		var deregister1 = $rootScope.$on(config.invoice.events.invoiceDetailSelected, function (event, invoiceNumber) {
			console.debug('invoice selected:' + invoiceNumber);
			// Switch tab.
			$scope.changeTab('invoiceDetail');
			updatedSelectedInvoice(invoiceNumber);
			updateInvoiceList();
		});

		// Unregister listeners
		$scope.$on('$destroy', function () {
			if (_.isFunction(deregister1)) {
				deregister1();
			}
		});

	}];
