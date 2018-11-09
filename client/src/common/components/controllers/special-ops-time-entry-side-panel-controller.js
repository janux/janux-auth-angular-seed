'use strict';

var _ = require('lodash');

module.exports = ['$rootScope', '$scope', 'operationService', 'timeEntryService', '$mdDialog', '$timeout', '$modal', '$filter', 'operationUtilServiceSideNav', 'config',
	function ($rootScope, $scope, operationService, timeEntryService, $mdDialog, $timeout, $modal, $filter, operationUtilServiceSideNav, config) {


		// var dateTimeFormatString = agGridComp.dateTimeCellEditor.formatString;
		var allDrivers;
		var driversAssignedToOperations;
		var vehiclesAssignedToOperations;
		var allVehicles;
		var operations;
		var selectedDriver;
		$scope.lbRow = {};
		$scope.timeEntryUpdate = {};

		// Models used when entering the search query for the autocomplete fields
		$scope.lbSearch = {
			staff    : '',
			operation: '',
			provider : '',
			vehicle  : ''
		};

		var initRowModel = function () {
			var today = moment().startOf('day').toDate();
			$scope.timeEntryUpdate = undefined;
			$scope.lbRow = {
				staff                 : '',
				operation             : '',
				// Start billable hour.
				start                 : undefined,
				//End billable work.
				end                   : undefined,
				// Star work hour.
				startWork             : undefined,
				// End work hour.
				endWork               : undefined,
				// The following dates and showed in the Form, with this info the controller calculates
				// the correct dates.
				startForm             : today,
				startHourForm         : today,
				startHourWorkForm     : today,
				endHourForm           : today,
				endHourWorkForm       : today,
				differenceTimeForm    : undefined,
				differenceTimeWorkForm: undefined,
				provider              : '',
				location              : '',
				function              : ''
			};
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

		function createFilterForVehicle(query) {
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

		function createFilterForOps(query) {
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
		$scope.acceptTimeEntry = function () {
			if (_.isNil($scope.timeEntryUpdate)) {
				// Perform an insert.
				operationUtilServiceSideNav.createAndInsertSpecialOpsTimeEntry($scope, initRowModel);
			} else {
				// Perform an update.
				operationUtilServiceSideNav.createSpecialOpsTimeEntryForUpdate($scope, $rootScope)
			}

		};

		$scope.export = function () {
			var ids = [];

			$scope.gridOptions.api.forEachNodeAfterFilter(function (item) {
				ids.push(item.data.id);
			});

			timeEntryService.timeEntryReportSpecialOps(ids);
		};

		/**
		 * Calculate end and endWork
		 */
		$scope.calculateDates = function () {
			// console.log("Call to calculateDates");
			var startMoment = moment($scope.lbRow.startForm);
			var endMoment = moment($scope.lbRow.startForm);
			var startWorkMoment = moment($scope.lbRow.startForm);
			var endWorkMoment = moment($scope.lbRow.startForm);
			var differenceHoursMoment;
			var differenceHoursWorkMoment;
			var startTemp;
			var endTemp;


			// Billable dates.
			startTemp = moment($scope.lbRow.startHourForm);
			startMoment = startMoment.hours(startTemp.hours()).minutes(startTemp.minutes());
			endTemp = moment($scope.lbRow.endHourForm);
			if (startTemp.hours() > endTemp.hours() || (startTemp.hours() === endTemp.hours() && endTemp.minutes() < startTemp.minutes())) {
				endMoment = endMoment.hours(endTemp.hours()).minutes(endTemp.minutes()).add(1, 'days');
				// endMoment.add(endTemp.hours(), 'hours').add(1, 'days').add(endTemp.minutes(), 'minutes');
			} else {
				endMoment = endMoment.hours(endTemp.hours()).minutes(endTemp.minutes());
				//endMoment.add(endTemp.hours(), 'hours').add(endTemp.minutes(), 'minutes');
			}
			differenceHoursMoment = operationService.calculateDuration(startMoment.toDate(), endMoment.toDate());

			//Workable dates.
			startTemp = moment($scope.lbRow.startHourWorkForm);
			startWorkMoment = startWorkMoment.hours(startTemp.hours()).minutes(startTemp.minutes());
			endTemp = moment($scope.lbRow.endHourWorkForm);
			if (startTemp.hours() > endTemp.hours() || (startTemp.hours() === endTemp.hours() && endTemp.minutes() < startTemp.minutes())) {
				endWorkMoment = endWorkMoment.hours(endTemp.hours()).minutes(endTemp.minutes()).add(1, 'days');
			} else {
				endWorkMoment = endWorkMoment.hours(endTemp.hours()).minutes(endTemp.minutes());
			}
			differenceHoursWorkMoment = operationService.calculateDuration(startWorkMoment.toDate(), endWorkMoment.toDate());

			$scope.lbRow.start = startMoment.toDate();
			$scope.lbRow.end = endMoment.toDate();

			$scope.lbRow.startWork = startWorkMoment.toDate();
			$scope.lbRow.endWork = endWorkMoment.toDate();

			$scope.lbRow.differenceTimeForm = differenceHoursMoment;
			$scope.lbRow.differenceTimeWorkForm = differenceHoursWorkMoment;

		};

		$scope.init = function () {
			operationService.findDriversAndSpecialOps().then(function (driversAndOps) {
				allDrivers = driversAndOps.allPersonnelAvailableForSelection;
				driversAssignedToOperations = driversAndOps.driversAssignedToOperations;
				vehiclesAssignedToOperations = driversAndOps.vehiclesAssignedToOperations;
				allVehicles = driversAndOps.vehicles;
				operations = driversAndOps.operations;
				initRowModel();
				$scope.calculateDates();
			});
		};

		/*****
		 The following events are defined in order so set the form.
		 ****/
		$rootScope.$on(config.timeEntry.specialOps.events.clearForm, function () {
			initRowModel();
		});

		/**
		 * When this event is catch, the form shows the selected data to update.
		 */
		$rootScope.$on(config.timeEntry.specialOps.events.setUpdateMode, function (event, timeEntry) {
			console.debug("Catch event " + config.timeEntry.specialOps.events.setUpdateMode + " with timeEntry %o", timeEntry);
			//Fill form data.
			fillFormData(timeEntry);

		});

		function fillFormData(timeEntry) {
			$scope.timeEntryUpdate = timeEntry;
			const resourceStaff = timeEntry.staff;
			// Selecting the staff.
			for (var i = 0; i < allDrivers.length; i++) {
				var staff = allDrivers[i];
				if (staff.resource.id === resourceStaff.resource.id) {
					$scope.lbRow.staff = staff;
					break;
				}
			}
			// Selecting the operation
			const operationId = timeEntry.operation.id;
			for (var j = 0; j < operations.length; j++) {
				var operationElement = operations[j];
				if (operationElement.id === operationId) {
					$scope.lbRow.operation = operationElement;
					break;
				}

			}
			$scope.lbRow.function = _.clone(resourceStaff.type);
			// Setting the dates.
			$scope.lbRow.start = _.clone(timeEntry.begin);
			$scope.lbRow.end = _.clone(timeEntry.end);
			$scope.lbRow.startWork = _.clone(timeEntry.beginWork);
			$scope.lbRow.endWork = _.clone(timeEntry.endWork);

			$scope.lbRow.startForm = _.clone(timeEntry.begin);
			$scope.lbRow.startHourForm = _.clone(timeEntry.begin);
			$scope.lbRow.startHourWorkForm = _.clone(timeEntry.beginWork);

			$scope.lbRow.endHourForm = _.clone(timeEntry.end);
			$scope.lbRow.endHourWorkForm = _.clone(timeEntry.endWork);

			// Calculate dates.
			$scope.calculateDates();

			//Selecting vehicle.
			const vehicleResource = timeEntry.vehicle;
			if (!_.isNil(vehicleResource)) {
				for (var k = 0; k < allVehicles.length; k++) {
					var vehicleElement = allVehicles[k];
					if (vehicleResource.resource.id === vehicleElement.resource.id) {
						$scope.lbRow.vehicle = vehicleElement;
						break;
					}
				}
				$scope.lbRow.odometerStart = vehicleResource.odometerStart;
				$scope.lbRow.odometerEnd = vehicleResource.odometerEnd;
				$scope.lbRow.fuelStart = vehicleResource.fuelStart;
				$scope.lbRow.fuelEnd = vehicleResource.fuelEnd;
			}

			//Defining comments.
			$scope.lbRow.location = timeEntry.comment;

		}

		$scope.init();
	}];