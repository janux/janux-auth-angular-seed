'use strict';
var _ = require('lodash');

module.exports =
	['$scope', '$modal', 'invoiceService', 'resourceService', '$state', '$timeout', '$filter', '$rootScope', 'config', '$mdDialog', 'nameQueryService','invoice', function (
		$scope, $modal, invoiceService, resourceService, $state, $timeout, $filter, $rootScope, config, $mdDialog, nameQueryService,invoice) {

		$scope.form = {
			name: '',
			cost: 0
		};
		$scope.persons = [];
		$scope.lbSearch = {
			staff: ''
		};
		var infoDialog = function (translateKey) {
			$modal.open({
				templateUrl: 'app/dialog-tpl/info-dialog.html',
				controller : ['$scope', '$modalInstance',
					function ($scope, $modalInstance) {
						$scope.message = $filter('translate')(translateKey);
						$scope.ok = function () {
							$modalInstance.close();
						};
					}],
				size       : 'md'
			});
		};

		$scope.insertExpense = function () {
			if (validateForm()) {
				var expenseToInsert = {
					name  : $scope.form.name,
					date  : $scope.form.date,
					cost  : $scope.form.cost,
					person: $scope.form.person,
					client: $scope.invoice.client
				};
				return invoiceService.insertExpense($scope.invoice.invoiceNumber, $scope.invoice.items[0].name, expenseToInsert)
					.then(function (result) {
						// Close the popup.
						$mdDialog.hide();
					});
			}
		};

		$scope.cancel = function () {
			$mdDialog.cancel();
		};

		$scope.staffSearch = function (query) {
			return query ? $scope.persons.filter(nameQueryService.createFilterForPerson(query)) : $scope.persons;
		};

		$scope.staffSelectedItemChange = function (item) {
			// $scope.form.person = item;
		};


		function validateForm() {
			var isValid = true;
			// Validate information.
			if (!_.isNumber($scope.form.cost) || $scope.form.cost <= 0) {
				isValid = false;
				infoDialog('services.invoice.expenses.invalidCost');
			} else if ($scope.form.name.trim() === '') {
				isValid = false;
				infoDialog('services.invoice.expenses.invalidName');
			} else if (!_.isDate($scope.form.date)) {
				isValid = false;
				infoDialog('services.invoice.expenses.invalidDate');
			} else if (_.isNil($scope.form.person)) {
				isValid = false;
				infoDialog('services.invoice.expenses.invalidPerson');
			}
			return isValid;
		}

		function init() {
			$scope.invoice = invoice;
			resourceService.findAvailableResourcesByVendor(config.glarus)
				.then(function (result) {
					const resourcePerson = _.filter(result, function (o) {
						return o.type !== "VEHICLE";
					});
					$scope.persons = _.map(resourcePerson, function (o) {
						return o.resource;
					})
				});
		}

		init();
	}];
