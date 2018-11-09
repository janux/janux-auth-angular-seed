'use strict';

var _ = require('lodash');
var moment = require('moment');

module.exports = ['$rootScope', '$scope', 'operationService', 'timeEntryService', '$mdDialog', '$timeout', '$modal', '$filter', 'operationUtilServiceSideNav', 'config', 'nameQueryService',
	function ($rootScope, $scope, operationService, timeEntryService, $mdDialog, $timeout, $modal, $filter, operationUtilServiceSideNav, config, nameQueryService) {


		// var dateTimeFormatString = agGridComp.dateTimeCellEditor.formatString;
		var allDrivers;
		var driversAssignedToOperations;
		var vehiclesAssignedToOperations;
		var allVehicles;
		var operations;
		var selectedDriver;
		// This flags helps to prevent change the operation
		// and vehicle when the system define the staff.
		var automaticOperationAndVehicleChange = true;
		$scope.lbRow = {};
		$scope.timeEntryUpdate = {};

		// Models used when entering the search query for the autocomplete fields
		$scope.lbSearch = {
			staff    : '',
			operation: '',
			provider : '',
			vehicle  : ''
		};

		var clearForm = function () {
			automaticOperationAndVehicleChange = true;
			console.debug("Call to clearForm");
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
			console.debug("Call to staffSelectedItemChange");
			var filteredDrivers;
			var operationId;
			var staffOperations;
			var candidateVehicle;
			var selectedOperation;
			if (typeof item !== 'undefined' && automaticOperationAndVehicleChange === true) {
				// This item should contain the selected staff member
				console.debug('Item changed to ' + JSON.stringify(item));

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

					console.debug('Selected staff operations', staffOperations);
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
				console.debug("Not item changed, maybe the flag is marked as false or the user selected a blank record");
				// if (automaticOperationAndVehicleChange === false) {
				// 	console.debug("Setting the flag automaticOperationAndVehicleChange as true ");
				// 	automaticOperationAndVehicleChange = true;
				// }
			}
		};

		$scope.staffSearch = function (query) {
			console.debug("Call to staffSearch");
			return query ? allDrivers.filter(nameQueryService.createFilterForStaff(query)) : allDrivers;
		};

		function createFilterForVehicle(query) {
			console.debug("Call to createFilterForVehicle");
			return function filterFn(elementVehicle) {
				var displayName = elementVehicle.resource.name + elementVehicle.resource.plateNumber;
				return displayName.toLowerCase().includes(query.toLowerCase());
			};
		}

		$scope.vehicleSearch = function (query) {
			console.debug("Call to vehicleSearch");
			return query ? allVehicles.filter(createFilterForVehicle(query)) : allVehicles;
		};


		function createFilterForOps(query) {
			console.debug("Call to createFilterForOps");
			return function filterFn(operation) {
				return operation.name.toLowerCase().includes(query.toLowerCase());
			};
		}

		$scope.opsSearch = function (query) {
			console.debug("Call to opsSearch");
			return query ? operations.filter(createFilterForOps(query)) : operations;
		};

		// This event is called when the user has modified the form information in the side panel.
		var acceptTimeEntry = function () {
			if (_.isNil($scope.timeEntryUpdate)) {
				// Perform an insert.
				operationUtilServiceSideNav.createAndInsertSpecialOpsTimeEntry($scope, clearForm);
			} else {
				// Perform an update.
				operationUtilServiceSideNav.createSpecialOpsTimeEntryForUpdate($scope, $rootScope)
			}
		};

		$scope.export = function () {
			console.debug("Call to export");
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
			console.debug("Call to calculateDates");
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
			console.debug("Call to init");
			operationService.findDriversAndSpecialOps().then(function (driversAndOps) {
				allDrivers = driversAndOps.allPersonnelAvailableForSelection;
				driversAssignedToOperations = driversAndOps.driversAssignedToOperations;
				vehiclesAssignedToOperations = driversAndOps.vehiclesAssignedToOperations;
				allVehicles = driversAndOps.vehicles;
				operations = driversAndOps.operations;
				clearForm();
				$scope.calculateDates();
			});
		};


		function fillFormData(timeEntry) {
			console.debug("Call fillFormData with timeEntry: %o", timeEntry);
			// Set the flag as false.
			// When whe set the driver , the method staffSelectedItemChange is called. With this flag
			// we avoid to change the operation and vehicle data when we define the staff.
			console.debug("Setting the flag automaticOperationAndVehicleChange as false ");
			automaticOperationAndVehicleChange = false;
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
			console.debug("operationId %s", operationId);
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

		/*****
		 * EVENTS:
		 * The following events are defined in order so set the form.
		 ****/
		$rootScope.$on(config.timeEntry.specialOps.events.clearForm, function () {
			console.debug("Catch %s event", config.timeEntry.specialOps.events.clearForm);
			clearForm();
		});

		/**
		 * When this event is catch, the form shows the selected data to update.
		 */
		$rootScope.$on(config.timeEntry.specialOps.events.setUpdateMode, function (event, timeEntry) {
			console.debug("Catch event %s with timeEntry %o", config.timeEntry.specialOps.events.setUpdateMode, timeEntry);
			//Fill form data.
			fillFormData(timeEntry);

		});

		/**
		 * When this event is catch. It mean the uses has click in the "accept" button of the side panel header.
		 *
		 */
		$rootScope.$on(config.timeEntry.specialOps.events.submitForm, function () {
			console.debug("Catch event %s", config.timeEntry.specialOps.events.submitForm);
			// Calls the method that inserts or update a time entry.z
			acceptTimeEntry();
		});


		$scope.init();
	}];
