'use strict';

var infoDialog = require('./info-dialog');
var agGridComp = require('common/ag-grid-components');
var _ = require('lodash');

module.exports = ['$scope','operationService','timeEntryService','$mdDialog','$timeout','$modal','$filter',
function ($scope , operationService , timeEntryService , $mdDialog , $timeout, $modal, $filter) {

	operationService.findDriversAndSpecialOps().then(function (driversAndOps) {

		var dateTimeFormatString = agGridComp.dateTimeCellEditor.formatString;
		var allDrivers = driversAndOps.allPersonnelAvailableForSelection;
		var driversAssignedToOperations = driversAndOps.driversAssignedToOperations;
		var vehiclesAssignedToOperations = driversAndOps.vehiclesAssignedToOperations;
		var allVehicles = driversAndOps.vehicles;
		var operations = driversAndOps.operations;
		var selectedDriver;

		function setExtraFlag(resource) {
			if (resource.resource.isExternal === true) {
				resource.isExternal = true;
			}
			return resource;
		}

		var initRowModel = function () {
			$scope.lbRow = {
				staff    : '',
				operation: '',
				start    : moment().startOf('day').format(dateTimeFormatString),
				end      : undefined,
				provider : '',
				location : '',
				function : ''
			};
		};
		initRowModel();

		// Models used when entering the search query for the autocomplete fields
		$scope.lbSearch = {
			staff    : '',
			operation: '',
			provider : '',
			vehicle  : ''
		};

		//
		// Staff autocomplete
		//
		$scope.staffSelectedItemChange = function (item) {
			var filteredDrivers;
			var operationId;
			var staffOperations;
			var candidateVehicle;
			var selectedOperation;
			if (typeof item !== 'undefined') {
				// This item should contain the selected staff member
				console.info('Item changed to ' + JSON.stringify(item));

				filteredDrivers = _.filter(driversAssignedToOperations, function (o) {
					return o.resource.id === item.resource.id;
				});

				if (filteredDrivers.length === 0) {
					$scope.lbRow.operation = undefined;
				} else {

					var candidateOperations = _.filter(operations, function (o) {
						return _.find(filteredDrivers, function (it) {
							return it.opId === o.id;
						});
					});

					if (candidateOperations.length === 0) {
						$scope.lbRow.operation = undefined;
						return;
					}

					candidateOperations = _.orderBy(candidateOperations, ['start'], ['desc']);
					selectedOperation = candidateOperations[0];

					// Looking for operation.
					selectedDriver = _.find(driversAssignedToOperations, function (o) {
						return o.opId === selectedOperation.id;
					});

					// Setting the associated person.
					operationId = selectedOperation.id;
					staffOperations = _.filter(operations, {id: operationId});

					console.log('Selected staff operations', staffOperations);
					$scope.lbRow.operation = staffOperations[0];
					$scope.lbRow.function = selectedDriver.type;

					// Setting the associated vehicle.
					candidateVehicle = _.find(vehiclesAssignedToOperations, function (o) {
						return o.opId === operationId;
					});

					if (!_.isNil(candidateVehicle)) {
						var vehicleSelectedItem = _.find(allVehicles, function (o) {
							return candidateVehicle.resource.id === o.resource.id;
						});
						if (!_.isNil(vehicleSelectedItem)) {
							$scope.lbRow.vehicle = vehicleSelectedItem;
						}
					}
				}
			} else {
				// This means that the entered search text is empty or doesn't match any staff member
			}
		};

		$scope.staffSearch = function (query) {
			return query ? allDrivers.filter(nameQueryService.createFilterForStaff(query)) : allDrivers;
		};

		function createFilterForVehicle (query) {
			return function filterFn(elementVehicle) {
				var displayName = elementVehicle.resource.name + elementVehicle.resource.plateNumber;
				return displayName.toLowerCase().includes(query.toLowerCase());
			};
		}

		$scope.vehicleSearch = function (query) {
			return query ? allVehicles.filter(createFilterForVehicle(query)) : allVehicles;
		};

		//
		// Operation autocomplete
		//
		$scope.opsSelectedItemChange = function (item) {
			if (typeof item !== 'undefined') {
				// This item should contain the selected operation
				// console.info('Item changed to ' + JSON.stringify(item));
			} else {
				// This means that the entered search text is empty or doesn't match any operation
			}
		};

		function createFilterForOps (query) {
			return function filterFn(operation) {
				var contains = operation.name.toLowerCase().includes(query.toLowerCase());
				return contains;
			};
		}

		$scope.opsSearch = function (query) {
			return query ? operations.filter(createFilterForOps(query)) : operations;
		};

		$scope.showVehicleDataPopup = function () {

			// Show popup.
			$mdDialog.show({
				clickOutsideToClose: true,
				templateUrl        : 'common/components/templates/vehicle-info-popup.html',
				scope              : $scope,
				preserveScope      : true,
				controller         : function ($scope, $mdDialog) {

					$scope.closeVehiclePopup = function () {
						$mdDialog.hide();
					};
				}
			});
		};

		// Add new record
		$scope.addRow = function () {
			// Selected person

			if (!$scope.lbRow.staff) {
				infoDialog('operations.dialogs.invalidStaff', $modal, $filter);
				return;
			}

			if (!$scope.lbRow.operation && !$scope.operationId) {
				infoDialog('operations.dialogs.invalidOperation', $modal, $filter);
				return;
			}

			if (!$scope.lbRow.function) {
				infoDialog('operations.dialogs.invalidFunction', $modal, $filter);
				return;
			}

			//////
			if (!!$scope.specialServiceAddForm.$valid) {
				var begin = moment($scope.lbRow.start);
				var end = '', endToInsert;
				var vehicle;

				if (_.isNil($scope.lbRow.end) === false) {
					end = moment($scope.lbRow.end);
					endToInsert = end.toDate();

					if (begin > end) {
						infoDialog('operations.dialogs.endDateError', $modal, $filter);
						return;
					}
				}

				if (!_.isNil($scope.lbRow.odometerEnd) && !_.isNil($scope.lbRow.odometerStart) &&
					_.toNumber($scope.lbRow.odometerStart) > _.toNumber($scope.lbRow.odometerEnd)) {
					infoDialog('operations.dialogs.odometerStartGreaterThanEnd', $modal, $filter);
					return;
				}

				var specialOpsTimeEntryToInsert = {
					'resources'  : [_.clone($scope.lbRow.staff)],
					'principals' : [],
					'attributes' : [],
					'type'       : 'SPECIAL_OPS',
					'comment'    : $scope.lbRow.location,
					'begin'      : begin.toDate(),
					'end'        : endToInsert,
					'billable'   : true,
					'idOperation': $scope.operationId || $scope.lbRow.operation.id
				};


				specialOpsTimeEntryToInsert.resources[0].type = $scope.lbRow.function;
				specialOpsTimeEntryToInsert.resources[0] = setExtraFlag(specialOpsTimeEntryToInsert.resources[0]);

				// Adding the vehicle resource.
				if (!_.isNil($scope.lbRow.vehicle)) {
					vehicle = _.clone($scope.lbRow.vehicle);
					// Adding the vehicle fuel and odometer values.
					vehicle.odometerStart = $scope.lbRow.odometerStart;
					vehicle.odometerEnd = $scope.lbRow.odometerEnd;
					vehicle.fuelStart = $scope.lbRow.fuelStart;
					vehicle.fuelEnd = $scope.lbRow.fuelEnd;

					specialOpsTimeEntryToInsert.resources[1] = vehicle;
				}
				console.log('specialOpsTimeEntryToInsert', specialOpsTimeEntryToInsert);

				timeEntryService.insert(specialOpsTimeEntryToInsert).then(function () {
					$scope.findTimeEntries($scope.periodFilterKey);

					// Wait before performing the form reset
					$timeout(function () {
						initRowModel();
						$scope.specialServiceAddForm.$setUntouched(true);
						$scope.specialServiceAddForm.$setPristine(true);
						// Go to last page
						// $scope.gridOptions.api.paginationGoToLastPage();
					}, 10);
				});
			}
		};

		$scope.export = function () {
			var ids = [];

			$scope.gridOptions.api.forEachNodeAfterFilter(function (item) {
				ids.push(item.data.id);
			});

			timeEntryService.timeEntryReportSpecialOps(ids);
		};
	});
}];
