'use strict';

var _ = require('lodash');
var moment = require('moment');

module.exports = ['$rootScope', '$scope', 'operationService', 'timeRecordService', '$mdDialog', '$timeout', '$modal', '$filter', 'config', 'nameQueryService', 'dialogService', '$mdSidenav',
	function ($rootScope, $scope, operationService, timeRecordService, $mdDialog, $timeout, $modal, $filter, config, nameQueryService, dialogService, $mdSidenav) {
		var sidenavInstance;
		var allDrivers;
		var driversAssignedToOperations;
		var vehiclesAssignedToOperations;
		var allVehicles;
		var operations;
		var selectedDriver;
		// This flags helps to prevent change the operation
		// and vehicle when the system define the staff.
		var automaticOperationAndVehicleChange = true;
		// Form data
		$scope.form = {};
		// This variable contain the time entry reference when there is an update.
		$scope.timeEntryUpdate = undefined;

		// This variable contains the operationId when there is an insert.
		$scope.operaitionIdInsert = undefined;

		// Models used when entering the search query for the autocomplete fields
		$scope.lbSearch = {
			staff    : '',
			operation: '',
			provider : '',
			vehicle  : ''
		};

		/**
		 * Clear the form.
		 */
		var clearForm = function () {
			automaticOperationAndVehicleChange = true;
			console.debug("Call to clearForm");
			var today = moment().startOf('day').toDate();
			$scope.timeEntryUpdate = undefined;
			$scope.form = {
				staff                 : '',
				operation             : '',
				// Start working hour.
				start                 : undefined,
				//End working work.
				end                   : undefined,
				// Star invoice hour.
				startInvoice          : undefined,
				// End work hour.
				endInvoice            : undefined,
				// The following dates and showed in the Form, with this info the controller calculates
				// the correct dates.
				startForm             : today,
				startHourForm         : undefined,
				startHourInvoiceForm  : undefined,
				endHourForm           : undefined,
				endHourInvoiceForm    : undefined,
				differenceTimeForm    : undefined,
				differenceTimeWorkForm: undefined,
				provider              : '',
				location              : '',
				function              : ''
			};
		};

		/**
		 * Fil the operation select when inserting a time entry.
		 * @param operationId
		 */
		function fillFormDataForInsert(operationId) {
			if (_.isString(operationId) && operationId.trim() !== '') {
				for (var j = 0; j < operations.length; j++) {
					var operationElement = operations[j];
					if (operationElement.id === operationId) {
						automaticOperationAndVehicleChange = false;
						$scope.operaitionIdInsert = operationId;
						$scope.form.operation = operationElement;
						break;
					}
				}
			}
		}

		/**
		 * Fill the form data given a time entry.
		 * @param timeEntry
		 */
		function fillFormDataForUpdate(timeEntry) {
			console.debug("Call fillFormDataForUpdate with timeEntry: %o", timeEntry);
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
					$scope.form.staff = staff;
					break;
				}
			}
			// Selecting the operation
			const operationId = timeEntry.operation.id;
			console.debug("operationId %s", operationId);
			for (var j = 0; j < operations.length; j++) {
				var operationElement = operations[j];
				if (operationElement.id === operationId) {
					$scope.form.operation = operationElement;
					break;
				}
			}

			$scope.form.function = _.clone(resourceStaff.type);
			// Setting the dates.
			$scope.form.start = _.clone(timeEntry.begin);
			$scope.form.end = _.clone(timeEntry.end);
			$scope.form.beginInvoice = _.clone(timeEntry.beginInvoice);
			$scope.form.endInvoice = _.clone(timeEntry.endInvoice);

			$scope.form.startForm = _.clone(timeEntry.begin);
			$scope.form.startHourForm = _.clone(timeEntry.begin);
			$scope.form.startHourInvoiceForm = _.clone(timeEntry.beginInvoice);

			$scope.form.endHourForm = _.clone(timeEntry.end);
			$scope.form.endHourInvoiceForm = _.clone(timeEntry.endInvoice);

			// Calculate dates.
			$scope.calculateDates();

			//Selecting vehicle.
			const vehicleResource = timeEntry.vehicle;
			if (!_.isNil(vehicleResource)) {
				for (var k = 0; k < allVehicles.length; k++) {
					var vehicleElement = allVehicles[k];
					if (vehicleResource.resource.id === vehicleElement.resource.id) {
						$scope.form.vehicle = vehicleElement;
						break;
					}
				}
				$scope.form.odometerStart = vehicleResource.odometerStart;
				$scope.form.odometerEnd = vehicleResource.odometerEnd;
				$scope.form.fuelStart = vehicleResource.fuelStart;
				$scope.form.fuelEnd = vehicleResource.fuelEnd;
			}

			//Defining comments.
			$scope.form.location = timeEntry.comment;
		}

		/**
		 * Generate a time entry based of the information
		 * captured in the form.
		 */
		var getFormData = function () {
			var vehicle;
			var timeEntryForm = {
				'resources'   : [_.clone($scope.form.staff)],
				'principals'  : [],
				'attributes'  : [],
				'type'        : 'SPECIAL_OPS',
				'comment'     : $scope.form.location,
				'begin'       : $scope.form.start,
				'end'         : $scope.form.end,
				'beginInvoice': $scope.form.startInvoice,
				'endInvoice'  : $scope.form.endInvoice,
				'billable'    : true,
				'idOperation' : $scope.operationId || $scope.form.operation.id
			};

			timeEntryForm.resources[0].type = $scope.form.function;
			timeEntryForm.resources[0] = setExtraFlagSpecialOpsTimeEntries(timeEntryForm.resources[0]);
			timeEntryForm = setTransportFlag(timeEntryForm);

			// Adding the vehicle resource.
			if (!_.isNil($scope.form.vehicle)) {
				vehicle = _.clone($scope.form.vehicle);
				// Adding the vehicle fuel and odometer values.
				vehicle.odometerStart = $scope.form.odometerStart;
				vehicle.odometerEnd = $scope.form.odometerEnd;
				vehicle.fuelStart = $scope.form.fuelStart;
				vehicle.fuelEnd = $scope.form.fuelEnd;

				timeEntryForm.resources[1] = vehicle;
			}

			return timeEntryForm;
		};

		/**
		 * Validate form data before insert or update.
		 * @return {boolean} Returns true if the form data is valid.
		 */
		function validateForm() {
			console.debug("special-ops-time-entry-side-panel-controller:  Call to validateForm");
			var result = true;

			// Selected person
			if (!$scope.form.staff) {
				dialogService.info('operations.dialogs.invalidStaff', false);
				result = false;
			} else if (!$scope.form.operation && !$scope.operationId) {
				// Selected operation.
				dialogService.info('operations.dialogs.invalidOperation', false);
				result = false;
			} else if (!$scope.form.function) {
				// Selected function.
				dialogService.info('operations.dialogs.invalidFunction', false);
				result = false;
			} else if (!_.isNil($scope.form.odometerEnd) && !_.isNil($scope.form.odometerStart) &&
				_.toNumber($scope.form.odometerStart) > _.toNumber($scope.form.odometerEnd)) {
				// Validating odometer values.
				dialogService.info('operations.dialogs.odometerStartGreaterThanEnd', false);
				result = false;
			} else if (!_.isDate($scope.form.startForm)) {
				// At least there must be a defined data.
				dialogService.info('operations.dialogs.invalidStartDateForm', false);
				result = false;
			} else if (!_.isDate($scope.form.startHourForm)) {
				// Validating at leas de init working hour.
				dialogService.info('operations.dialogs.beginWorkDateError', false);
				result = false;

			} else if (_.isDate($scope.form.endHourInvoiceForm) && !_.isDate($scope.form.startHourInvoiceForm)) {
				// Validating billable hours if they are not undefined.
				dialogService.info('operations.dialogs.beginBillableDateError', false);
				result = false;
			}
			return result;
		}

		/**
		 * Set the external flag for special ops time entries.
		 * @param resource
		 * @return {*}
		 */
		function setExtraFlagSpecialOpsTimeEntries(resource) {
			if (resource.resource.staff && resource.resource.staff.isExternal === true) {
				resource.isExternal = true;
			}
			return resource;
		}

		/**
		 * Set the transport flag  in case the user has selected a transport.
		 * @param specialOpsTimeEntry
		 */
		function setTransportFlag(specialOpsTimeEntry) {
			if (specialOpsTimeEntry.resources[0].type === 'TRANSPORT') {
				specialOpsTimeEntry.attributes.push({
					name : config.timeEntry.attributeTransport,
					value: 'true'
				})
			}
			return specialOpsTimeEntry;
		}

		/**
		 * Calculate form dates special ops.
		 */
		$scope.calculateDates = function () {
			console.debug("Call to calculateDates special ops");

			var startMoment = moment($scope.form.startForm);
			var endMoment = moment($scope.form.startForm);
			var differenceHoursMoment;
			var startTemp;
			var endTemp;

			// Workable dates.
			startTemp = moment($scope.form.startHourForm);
			startMoment = startMoment.hours(startTemp.hours()).minutes(startTemp.minutes());

			if (_.isDate($scope.form.endHourForm)) {

				endTemp = moment($scope.form.endHourForm);
				if (startTemp.hours() > endTemp.hours() || (startTemp.hours() === endTemp.hours() && endTemp.minutes() < startTemp.minutes())) {
					endMoment = endMoment.hours(endTemp.hours()).minutes(endTemp.minutes()).add(1, 'days');

				} else {
					endMoment = endMoment.hours(endTemp.hours()).minutes(endTemp.minutes());

				}
				differenceHoursMoment = operationService.calculateDuration(startMoment.toDate(), endMoment.toDate());
				$scope.form.start = startMoment.toDate();
				$scope.form.end = endMoment.toDate();
				$scope.form.differenceTimeWorkForm = differenceHoursMoment;
			} else {
				$scope.form.start = startMoment.toDate();
				$scope.form.end = undefined;
				$scope.form.differenceTimeWorkForm = '';
			}


			//Billable hours.

			// Billable dates.

			if (_.isDate($scope.form.startHourInvoiceForm) && _.isDate($scope.form.endHourInvoiceForm)) {
				startTemp = moment($scope.form.startHourInvoiceForm);
				startMoment = startMoment.hours(startTemp.hours()).minutes(startTemp.minutes());
				endTemp = moment($scope.form.endHourInvoiceForm);
				if (startTemp.hours() > endTemp.hours() || (startTemp.hours() === endTemp.hours() && endTemp.minutes() < startTemp.minutes())) {
					endMoment = endMoment.hours(endTemp.hours()).minutes(endTemp.minutes()).add(1, 'days');

				} else {
					endMoment = endMoment.hours(endTemp.hours()).minutes(endTemp.minutes());

				}
				differenceHoursMoment = operationService.calculateDuration(startMoment.toDate(), endMoment.toDate());
				$scope.form.startInvoice = startMoment.toDate();
				$scope.form.endInvoice = endMoment.toDate();
				$scope.form.differenceTimeForm = differenceHoursMoment;
			} else if (_.isDate($scope.form.startHourInvoiceForm)) {
				startTemp = moment($scope.form.startHourInvoiceForm);
				startMoment = startMoment.hours(startTemp.hours()).minutes(startTemp.minutes());
				$scope.form.startInvoice = startMoment.toDate();
				$scope.form.endInvoice = undefined;
				$scope.form.differenceTimeForm = '';
			} else {
				$scope.form.startInvoice = undefined;
				$scope.form.endInvoice = undefined;
				$scope.form.differenceTimeForm = '';
			}


			/*// console.debug("Call to calculateDates");
			var startMoment = moment($scope.form.startForm);
			var endMoment = moment($scope.form.startForm);
			var startWorkMoment = moment($scope.form.startForm);
			var endWorkMoment = moment($scope.form.startForm);
			var differenceHoursMoment;
			var differenceHoursWorkMoment;
			var startTemp;
			var endTemp;

			// Billable dates.
			if (_.isDate($scope.form.startHourForm) && _.isDate($scope.form.endHourForm)) {
				startTemp = moment($scope.form.startHourForm);
				startMoment = startMoment.hours(startTemp.hours()).minutes(startTemp.minutes());
				endTemp = moment($scope.form.endHourForm);
				if (startTemp.hours() > endTemp.hours() || (startTemp.hours() === endTemp.hours() && endTemp.minutes() < startTemp.minutes())) {
					endMoment = endMoment.hours(endTemp.hours()).minutes(endTemp.minutes()).add(1, 'days');
					// endMoment.add(endTemp.hours(), 'hours').add(1, 'days').add(endTemp.minutes(), 'minutes');
				} else {
					endMoment = endMoment.hours(endTemp.hours()).minutes(endTemp.minutes());
					//endMoment.add(endTemp.hours(), 'hours').add(endTemp.minutes(), 'minutes');
				}
				$scope.form.start = startMoment.toDate();
				$scope.form.end = endMoment.toDate();
				differenceHoursMoment = operationService.calculateDuration(startMoment.toDate(), endMoment.toDate());
				$scope.form.differenceTimeForm = differenceHoursMoment;
			} else if (_.isDate($scope.form.startHourForm)) {
				startTemp = moment($scope.form.startHourForm);
				startMoment = startMoment.hours(startTemp.hours()).minutes(startTemp.minutes());
				$scope.form.start = startMoment.toDate();
				$scope.form.end = undefined;
				$scope.form.differenceTimeForm = '';
			} else {
				$scope.form.start = startMoment.hours(0);
				$scope.form.end = undefined;
				$scope.form.differenceTimeForm = '';
			}


			//Workable dates.
			if (_.isDate($scope.form.startHourWorkForm) && _.isDate($scope.form.endHourWorkForm)) {
				startTemp = moment($scope.form.startHourWorkForm);
				startWorkMoment = startWorkMoment.hours(startTemp.hours()).minutes(startTemp.minutes());
				endTemp = moment($scope.form.endHourWorkForm);
				if (startTemp.hours() > endTemp.hours() || (startTemp.hours() === endTemp.hours() && endTemp.minutes() < startTemp.minutes())) {
					endWorkMoment = endWorkMoment.hours(endTemp.hours()).minutes(endTemp.minutes()).add(1, 'days');
				} else {
					endWorkMoment = endWorkMoment.hours(endTemp.hours()).minutes(endTemp.minutes());
				}
				differenceHoursWorkMoment = operationService.calculateDuration(startWorkMoment.toDate(), endWorkMoment.toDate());
				$scope.form.startInvoice = startWorkMoment.toDate();
				$scope.form.endInvoice = endWorkMoment.toDate();
				$scope.form.differenceTimeWorkForm = differenceHoursWorkMoment;
			} else if (_.isDate($scope.form.startHourWorkForm)) {
				startTemp = moment($scope.form.startHourWorkForm);
				startWorkMoment = startWorkMoment.hours(startTemp.hours()).minutes(startTemp.minutes());
				$scope.form.startInvoice = startWorkMoment.toDate();
				$scope.form.endInvoice = undefined;
				$scope.form.differenceTimeWorkForm = '';
			} else {
				$scope.form.startInvoice = undefined;
				$scope.form.endInvoice = undefined;
				$scope.form.differenceTimeWorkForm = '';
			}*/
		};

		/**
		 * Sets the selected staff record in the UI for special ops.
		 * Also, if the staff has a relation to an operation, also define the operation and the associated vehicle.
		 * The association with the operation and vehicle only occurs when the flag automaticOperationAndVehicleChange
		 * is marked as true.
		 * @param item
		 */
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
					$scope.form.operation = undefined;
				} else {

					var candidateOperations = _.filter(operations, function (o) {
						return _.find(filteredDrivers, function (it) {
							return it.opId === o.id;
						});
					});

					if (candidateOperations.length === 0) {
						$scope.form.operation = undefined;
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
					$scope.form.operation = staffOperations[0];
					$scope.form.function = selectedDriver.type;

					// Setting the associated vehicle.
					candidateVehicle = _.find(vehiclesAssignedToOperations, function (o) {
						return o.opId === operationId;
					});

					if (!_.isNil(candidateVehicle)) {
						var vehicleSelectedItem = _.find(allVehicles, function (o) {
							return candidateVehicle.resource.id === o.resource.id;
						});
						if (!_.isNil(vehicleSelectedItem)) {
							$scope.form.vehicle = vehicleSelectedItem;
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

		/**
		 * This method is called when the user has modified the form information in the side panel and wants to insert
		 * or update.
		 */
		$scope.acceptTimeEntry = function () {
			$scope.calculateDates();
			if (validateForm()) {
				var timeEntryToSend = getFormData();
				if (_.isNil($scope.timeEntryUpdate)) {
					console.debug('Time entry to insert %o', timeEntryToSend);
					// Perform an insert
					timeRecordService.insert(timeEntryToSend, $scope.form.operation.id).then(function () {
						// Send a notification the update was successful.
						$rootScope.$broadcast(config.timeEntry.specialOps.events.doneInsertOrUpdate);
						// Close the panel.
						$mdSidenav(config.timeEntry.specialOps.sidePanel.id).toggle();
					});
				} else {
					// Add the id and perform an update
					timeEntryToSend.id = $scope.timeEntryUpdate.id;
					console.debug('Time entry to update %o', timeEntryToSend);
					timeRecordService.update(timeEntryToSend, $scope.form.operation.id).then(function () {
						// Send a notification the update was successful.
						$rootScope.$broadcast(config.timeEntry.specialOps.events.doneInsertOrUpdate);
						// Close the panel.
						$mdSidenav(config.timeEntry.specialOps.sidePanel.id).toggle();
					});
				}
			}
		};

		$scope.toggleSideNav = function () {
			$mdSidenav(config.timeEntry.specialOps.sidePanel.id).toggle();
		};

		/*****
		 * EVENTS:
		 * The following events are defined in order so set the form.
		 ****/

		/**
		 * This even is captured
		 */
		var unbindFunction1 = $rootScope.$on(config.timeEntry.specialOps.events.setInsertMode, function (event, operationId) {
			console.debug("Catch %s event", config.timeEntry.specialOps.events.setInsertMode);
			clearForm();
			fillFormDataForInsert(operationId);
			$mdSidenav(config.timeEntry.specialOps.sidePanel.id).open();
		});

		/**
		 * When this event is captured, the form shows the selected data to update.
		 */
		var unbindFunction2 = $rootScope.$on(config.timeEntry.specialOps.events.setUpdateMode, function (event, timeEntry) {
			console.debug("Catch event %s with timeEntry %o", config.timeEntry.specialOps.events.setUpdateMode, timeEntry);
			clearForm();
			fillFormDataForUpdate(timeEntry);
			$mdSidenav(config.timeEntry.specialOps.sidePanel.id).open();


		});

		/*****
		 * END EVENTS:
		 ****/

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

			if (_.isNil(sidenavInstance)) {
				sidenavInstance = $mdSidenav(config.timeEntry.specialOps.sidePanel.id, true);
				if (_.isFunction(sidenavInstance.then)) {
					sidenavInstance.then(function (instance) {
						instance.onClose(function () {
							$scope.timeEntryUpdate = undefined;
							console.debug('Sending close');
							// $scope.gridOptions.api.stopEditing();
							$rootScope.$broadcast(config.timeEntry.specialOps.events.canceled);
						});
					});
				}
			}
		};

		/*****
		 **This will hide the Vehicle Panel by default.
		 *****/
		$scope.vehiclePanelIsVisible = false;
		$scope.vehicleBtnIsVisible = true;
		$scope.vehiclePanelShowHide = function () {
			//If DIV is visible it will be hidden and vice versa, also button.
			$scope.vehiclePanelIsVisible = !$scope.vehiclePanelIsVisible;
			$scope.vehicleBtnIsVisible = !$scope.vehicleBtnIsVisible;
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
