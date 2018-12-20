'use strict';

var _ = require('lodash');
var moment = require('moment');

module.exports = ['$rootScope', '$scope', 'operationService', 'timeEntryService', '$mdDialog', '$timeout', '$filter', 'config', 'nameQueryService', 'dialogService', '$mdSidenav',
	function ($rootScope, $scope, operationService, timeEntryService, $mdDialog, $timeout, $filter, config, nameQueryService, dialogService, $mdSidenav) {

		var sidenavInstance;
		var allDrivers;
		var driversAssignedToOperations;
		var operations;
		// This flags helps to prevent change the operation
		// and vehicle when the system define the staff.
		var automaticOperationAndVehicleChange = true;

		// Form data
		$scope.form = {};

		// This variable contain the time entry reference when there is an update.
		$scope.timeEntryUpdate = undefined;


		// Models used when entering the search query for the autocomplete fields
		$scope.lbSearch = {
			staff    : '',
			operation: ''
		};

		function clearForm() {
			automaticOperationAndVehicleChange = true;
			var today = moment().startOf('day').toDate();
			$scope.form = {
				staff             : '',
				operation         : '',
				start             : today,
				end               : undefined,
				// The following dates and showed in the Form, with this info the controller calculates
				// the correct dates.
				startForm         : today,
				startHourForm     : today,
				endHourForm       : undefined,
				differenceTimeForm: undefined,
				location          : '',
				absence           : ''
			};
			$scope.calculateDates();
		};

		//
		// Staff autocomplete
		//
		$scope.staffSelectedItemChange = function (item) {
			if (typeof item !== 'undefined') {
				// This item should contain the selected staff member
				console.info('Item changed to ' + JSON.stringify(item));
				if (automaticOperationAndVehicleChange === true) {
					var selectedDriver = _.find(driversAssignedToOperations, function (o) {
						return o.resource.id === item.resource.id;
					});

					if (_.isNil(selectedDriver)) {
						$scope.form.operation = undefined;
					} else {
						var operationId = selectedDriver.opId;
						var staffOperations = _.filter(operations, {id: operationId});

						// operations.debug('Selected staff operations', staffOperations);
						$scope.form.operation = staffOperations[0];
					}
				}

			} else {
				// This means that the entered search text is empty or doesn't match any staff member
			}
		};

		$scope.staffSearch = function (query) {
			return query ? allDrivers.filter(nameQueryService.createFilterForStaff(query)) : allDrivers;
		};

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


		function handleAbsence(timeEntry, absence) {
			// If SF, then we must to set an empty value.
			if (absence === 'NO_SERVICE_PROVIDED') {
				timeEntry.extras = 'NO_SERVICE_PROVIDED';
				timeEntry.resources = [];
				timeEntry.billable = false;
			} else if (absence === 'SF') {
				timeEntry.resources[0].absence = '';
				timeEntry.billable = true;
				timeEntry.resources[0].type = 'DRIVER';
			} else if (_.isNil(absence) || absence.trim() === '') {
				timeEntry.resources[0].absence = '';
				timeEntry.billable = true;
				timeEntry.resources[0].type = 'DRIVER';
			} else {
				timeEntry.resources[0].absence = absence;
				timeEntry.billable = false;
				timeEntry.resources[0].type = 'DRIVER';
			}
			return timeEntry;
		}

		$scope.acceptTimeEntry = function () {
			$scope.calculateDates();
			if (validateForm()) {
				var timeEntryToSend = getFormData();
				if (_.isNil($scope.timeEntryUpdate)) {
					console.debug('Driver time entry to insert %o', timeEntryToSend);
					timeEntryService.insert(timeEntryToSend).then(function () {
						// Send a notification the update was successful.
						$rootScope.$broadcast(config.timeEntry.driver.events.doneInsertOrUpdate);
						// Close the panel.
						$mdSidenav(config.timeEntry.driver.sidePanel.id).toggle();
					});
				} else  {
					timeEntryToSend.id = $scope.timeEntryUpdate.id;
					console.debug('Time entry to update %o', timeEntryToSend);
					timeEntryService.update(timeEntryToSend).then(function () {
						// Send a notification the update was successful.
						$rootScope.$broadcast(config.timeEntry.driver.events.doneInsertOrUpdate);
						// Close the panel.
						$mdSidenav(config.timeEntry.driver.sidePanel.id).toggle();
					});
				}
			}
		};

		$scope.toggleSideNav = function () {
			$mdSidenav(config.timeEntry.driver.sidePanel.id).toggle();
		};

		function getFormData() {
			$scope.calculateDates();
			var timeEntry;
			var begin = $scope.form.start;
			var end = $scope.form.end;
			timeEntry = {
				'resources'  : [_.clone($scope.form.staff)],
				'principals' : [],
				'attributes' : [],
				'type'       : 'DRIVER',
				'comment'    : $scope.form.location,
				'begin'      : begin,
				'end'        : end,
				'billable'   : true,
				'idOperation': $scope.form.operation.id
			};
			timeEntry = handleAbsence(timeEntry, $scope.form.absence);
			return timeEntry;

		}

		function validateForm() {
			$scope.calculateDates();
			var result = true;
			if (_.isNil($scope.form.staff) && $scope.form.absence !== 'NO_SERVICE_PROVIDED') {
				dialogService.info('operations.dialogs.invalidStaff');
				result = false;
			} else if (_.isNil($scope.form.operation)) {
				dialogService.info('operations.dialogs.invalidOperation');
				result = false;
			} else if (!_.isDate($scope.form.startForm)) {
				dialogService.info('operations.dialogs.invalidStartDateForm', false);
				result = false;
			} else {
				var begin = $scope.form.start;
				var end = $scope.form.end;
				if (_.isNil($scope.form.end) === false) {
					if (begin > end) {
						dialogService.info('operations.dialogs.endDateError', false);
						result = false;
					}
				}
			}
			return result;
		}

		function fillFormDataForUpdate(timeEntry) {// Set the flag as false.
			// When whe set the driver , the method staffSelectedItemChange is called. With this flag
			// we avoid to change the operation and vehicle data when we define the staff.
			console.debug("Setting the flag automaticOperationAndVehicleChange as false ");
			automaticOperationAndVehicleChange = false;
			$scope.timeEntryUpdate = timeEntry;
			if (_.isNil(timeEntry.staff)) {
				$scope.lbSearch.staff = undefined;
			} else {
				for (var i = 0; i < allDrivers.length; i++) {
					var driver = allDrivers[i];
					if (driver.resource.id === timeEntry.staff.resource.id) {
						$scope.form.staff = driver;
						break;
					}
				}
			}

			for (var k = 0; k < operations.length; k++) {
				var operation = operations[k];
				if (operation.id === timeEntry.operation.id) {
					$scope.form.operation = operation;
					break;
				}
			}
			$scope.form.start = _.clone(timeEntry.begin);
			$scope.form.end = _.clone(timeEntry.end);
			$scope.form.startForm = _.clone(timeEntry.begin);
			$scope.form.startHourForm = _.clone(timeEntry.begin);
			$scope.form.endHourForm = _.clone(timeEntry.end);
			$scope.form.location = timeEntry.comment;
			$scope.form.absence = timeEntry.absence;
			$scope.calculateDates();
		}

		/*****
		 * EVENTS:
		 * The following events are defined in order so set the form.
		 ****/

		/**
		 * This even is captured
		 */
		var unbindFunction1 = $rootScope.$on(config.timeEntry.driver.events.setInsertMode, function () {
			console.debug("Catch %s event", config.timeEntry.driver.events.setInsertMode);
			clearForm();
			// fillFormDataForInsert(operationId);
			$mdSidenav(config.timeEntry.driver.sidePanel.id).open();
		});

		/**
		 * When this event is captured, the form shows the selected data to update.
		 */
		var unbindFunction2 = $rootScope.$on(config.timeEntry.driver.events.setUpdateMode, function (event, timeEntry) {
			console.debug("Catch event %s with timeEntry %o", config.timeEntry.driver.events.setUpdateMode, timeEntry);
			clearForm();
			fillFormDataForUpdate(timeEntry);
			$mdSidenav(config.timeEntry.driver.sidePanel.id).open();
		});


		/**
		 * Calculate form dates.
		 */
		$scope.calculateDates = function () {
			console.debug("Call to calculateDates");
			var startMoment = moment($scope.form.startForm);
			var endMoment = moment($scope.form.startForm);

			var differenceHoursMoment;

			var startTemp;
			var endTemp;

			// Billable dates.

			startTemp = moment($scope.form.startHourForm);
			startMoment = startMoment.hours(startTemp.hours()).minutes(startTemp.minutes());
			$scope.form.start = startMoment.toDate();
			if (_.isDate($scope.form.endHourForm)) {
				endTemp = moment($scope.form.endHourForm);
				if (startTemp.hours() > endTemp.hours() || (startTemp.hours() === endTemp.hours() && endTemp.minutes() < startTemp.minutes())) {
					endMoment = endMoment.hours(endTemp.hours()).minutes(endTemp.minutes()).add(1, 'days');
					// endMoment.add(endTemp.hours(), 'hours').add(1, 'days').add(endTemp.minutes(), 'minutes');
				} else {
					endMoment = endMoment.hours(endTemp.hours()).minutes(endTemp.minutes());
					//endMoment.add(endTemp.hours(), 'hours').add(endTemp.minutes(), 'minutes');
				}
				differenceHoursMoment = operationService.calculateDuration(startMoment.toDate(), endMoment.toDate());
				$scope.form.end = endMoment.toDate();
				$scope.form.differenceTimeForm = differenceHoursMoment;
			} else {
				$scope.form.end = undefined;
				$scope.form.differenceTimeForm = undefined;
				$scope.form.differenceTimeForm = '';
			}
		};


		/*****
		 * END EVENTS:
		 ****/

		$scope.init = function () {
			console.debug("Call to init");
			operationService.findDriversAndOperations()
				.then(function (driversAndOps) {
					allDrivers = driversAndOps.allPersonnelAvailableForSelection;
					driversAssignedToOperations = driversAndOps.driversAssignedToOperations;
					operations = driversAndOps.operations;
					clearForm();
					$scope.calculateDates();
				});

			if (_.isNil(sidenavInstance)) {
				sidenavInstance = $mdSidenav(config.timeEntry.driver.sidePanel.id, true);
				if (_.isFunction(sidenavInstance.then)) {
					sidenavInstance.then(function (instance) {
						instance.onClose(function () {
							$scope.timeEntryUpdate = undefined;
							console.debug('Sending close');
							$rootScope.$broadcast(config.timeEntry.driver.events.canceled);
						});
					});
				}
			}
		};


		/******
		 **Add functionality to the expand button
		 ******/
		$scope.bigpanel = false;
		$scope.addRemoveExpandClass = function () {
			if ($scope.bigpanel) {
				$scope.bigpanel = false;
			} else {
				$scope.bigpanel = true;
			}
		};

		$scope.init();

		// Unregister listeners
		$scope.$on('$destroy', function () {
			if (_.isFunction(unbindFunction1)) {
				unbindFunction1();
			}
			if (_.isFunction(unbindFunction2)) {
				unbindFunction2();
			}
		});

	}]
;
