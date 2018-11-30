'use strict';

var _ = require('lodash');
var moment = require('moment');

module.exports = ['$rootScope', '$scope', 'operationService', 'timeEntryService', '$mdDialog', '$timeout', '$modal', '$filter', 'config', 'nameQueryService', 'dialogService', '$mdSidenav',
	function ($rootScope, $scope, operationService, timeEntryService, $mdDialog, $timeout, $modal, $filter, config, nameQueryService, dialogService, $mdSidenav) {
		var sidenavInstance;

		var allGuards;
		var guardsAssignedToOperations;
		var operation;
		var selectedGuard;
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
		$scope.lbSearch = {};

		/**
		 * Clear the form.
		 */
		var clearForm = function () {
			automaticOperationAndVehicleChange = true;
			console.debug("Call to clearForm");
			var today = moment().startOf('day').toDate();


			$scope.timeEntryUpdate = undefined;
			$scope.form = {
				staff        : undefined,
				operation    : undefined,
				start        : today,
				end          : undefined,
				// The following dates and showed in the Form, with this info the controller calculates
				// the correct dates.
				startForm    : today,
				startHourForm: today,
				absence     : ''
			};
		};

		function handleAbsence(timeEntry, absence) {
			timeEntry.billable = false;
			timeEntry.resources[0].absence = absence;
			return timeEntry;
		}


		/**
		 * Fill the form data given a time entry.
		 * @param timeEntry
		 */
		function fillFormDataForUpdate(timeEntry) {
			console.debug("Call fillFormDataForUpdate with timeEntry: %o", timeEntry);
			// Set the flag as false.
			// When whe set the guard , the method staffSelectedItemChange is called. With this flag
			// we avoid to change the operation and vehicle data when we define the staff.
			console.debug("Setting the flag automaticOperationAndVehicleChange as false ");
			automaticOperationAndVehicleChange = false;
			$scope.timeEntryUpdate = timeEntry;
			if (_.isNil(timeEntry.staff)) {
				$scope.lbSearch.staff = undefined;
			} else {
				for (var i = 0; i < allGuards.length; i++) {
					var guard = allGuards[i];
					if (guard.resource.id === timeEntry.staff.resource.id) {
						$scope.form.staff = guard;
						break;
					}
				}
			}

			// for (var k = 0; k < operations.length; k++) {
			// 	var operation = operations[k];
			// 	if (operation.id === timeEntry.operation.id) {
			// 		$scope.form.operation = operation;
			// 		break;
			// 	}
			// }

			$scope.form.start = _.clone(timeEntry.begin);
			$scope.form.end = _.clone(timeEntry.end);
			$scope.form.startForm = _.clone(timeEntry.begin);
			$scope.form.startHourForm = _.clone(timeEntry.begin);
			$scope.form.endHourForm = _.clone(timeEntry.end);
			$scope.form.location = timeEntry.comment;
			$scope.form.absence = timeEntry.absence;
			$scope.calculateDates();
			
		}

		/**
		 * Generate a time entry based of the information
		 * captured in the form.
		 */
		var getFormData = function () {
			var begin = $scope.form.start;
			var end = $scope.form.end;
			var timeEntry = {
				'resources'  : [_.clone($scope.form.staff)],
				'principals' : [],
				'attributes' : [],
				'type'       : 'ATTENDANCE',
				'comment'    : $scope.form.location,
				'begin'      : begin,
				'end'        : end,
				'billable'   : true,
				'idOperation': operation.id,
				'absence'    : $scope.form.absence
			};

			timeEntry = setResourceType(timeEntry);
			timeEntry = setBillableFlag(timeEntry);
			timeEntry = setHoursInResource(operation, timeEntry);
			timeEntry = setExternalFlag(timeEntry, $scope.form.isExternal);
			timeEntry = handleAbsence(timeEntry, $scope.form.absence);
			
			return timeEntry;
		};


		// Fix resource type given the user input.
		function setResourceType(timeEntry) {

			// If night shift maintenance. Whe change the resource type.
			if (timeEntry.extras === 'NM') {
				timeEntry.resources[0].type = 'GUARD_NIGHT_SHIFT_MAINTENANCE';
			} else if (timeEntry.extras === 'NRM') {
				//If goods receipt. We change the resource type.
				timeEntry.resources[0].type = 'GUARD_GOODS_RECEIPT';
			} else if (timeEntry.extras === 'AF' || timeEntry.extras === 'A') {
				//If guard support. We change the resource type.
				timeEntry.resources[0].type = 'GUARD_SUPPORT';
			} else if (timeEntry.extras === 'CLOSED') {
				// If the store is closed. We remove the assigned resource/
				timeEntry.resources = [];
			} else if (timeEntry.extras === 'NOT COVERED') {
				// If the record is "Not covered". We remove the assigned resource.
				timeEntry.resources = [];
			} else if (timeEntry.extras === 'GUARD_SHIFT_MANAGER') {
				timeEntry.resources[0].type = 'GUARD_SHIFT_MANAGER';
			} else {
				// Default : Guard.
				timeEntry.resources[0].type = 'GUARD';
			}
			return timeEntry;
		}

		// Fill the initial hour and end hour to the time entry
		// attributes given the extra value and the operation defined
		function setHoursInResource(operation, timeEntry) {
			var initHourParameter;
			var endHourHourParameter;
			var initHourAttributeValuePair;
			var endHourAttributeValuePair;
			var timeEntryInitHourParameterName = 'init.hour';
			var timeEntryEndHourParameterName = 'end.hour';
			var existingAttributeValuePair;
			switch (timeEntry.extras) {
				case 'NM':
					initHourParameter = 'nightShiftMaintenance.initHour';
					endHourHourParameter = 'nightShiftMaintenance.endHour';
					break;
				case 'NRM':
					initHourParameter = 'goodsReceipt.initHour';
					endHourHourParameter = 'goodsReceipt.endHour';
					break;
				case 'A':
					initHourParameter = 'guardSupport.initHour';
					endHourHourParameter = 'guardSupport.endHour';
					break;
				case 'AF':
					initHourParameter = 'guardSupport.initHour';
					endHourHourParameter = 'guardSupport.endHour';
					break;
				case 'GUARD_SHIFT_MANAGER':
					initHourParameter = 'shiftManager.initHour';
					endHourHourParameter = 'shiftManager.endHour';
					break;
				default:
					initHourParameter = 'guard.initHour';
					endHourHourParameter = 'guard.endHour';
					break;
			}
			if (!_.isNil(initHourParameter) && !_.isNil(endHourHourParameter)) {
				initHourAttributeValuePair = _.find(operation.attributes, function (o) {
					return o.name === initHourParameter;
				});
				endHourAttributeValuePair = _.find(operation.attributes, function (o) {
					return o.name === endHourHourParameter;
				});


				//Fill time entry attributes.
				if (!_.isNil(initHourAttributeValuePair)) {
					existingAttributeValuePair = _.find(timeEntry.attributes, function (o) {
						return o.name === timeEntryInitHourParameterName;
					});

					if (existingAttributeValuePair) {
						existingAttributeValuePair.value = initHourAttributeValuePair.value;
					} else {
						timeEntry.attributes.push({
							name : timeEntryInitHourParameterName,
							value: initHourAttributeValuePair.value
						});
					}
				}

				if (!_.isNil(endHourAttributeValuePair)) {
					existingAttributeValuePair = _.find(timeEntry.attributes, function (o) {
						return o.name === timeEntryEndHourParameterName;
					});
					if (existingAttributeValuePair) {
						existingAttributeValuePair.value = endHourAttributeValuePair.value;
					} else {
						timeEntry.attributes.push({
							name : timeEntryEndHourParameterName,
							value: endHourAttributeValuePair.value
						});
					}
				}
			}
			return timeEntry;
		}

		// Set isBillableFlag given the user input.
		function setBillableFlag(timeEntry) {
			if (timeEntry.extras === 'A' || timeEntry.extras === 'CLOSED' || timeEntry.extras === 'NOT COVERED') {
				timeEntry.billable = false;
			}
			return timeEntry;
		}

		// Replacing base por empty string.
		// "BASE" is a temporal string that help to filter data in the ag-grid.
		//function setExtraFlag(timeEntry) {
		//	if (timeEntry.extras === 'BASE') {
		//		timeEntry.extras = '';
		//	}
		//	return timeEntry;
		//}

		function setExternalFlag(timeEntry, isExternal) {
			if (timeEntry.resources.length > 0) {
				if (isExternal === true) {
					timeEntry.resources[0].isExternal = true;
					// TODO: Replace this hardcoded id.
					timeEntry.resources[0].vendor.id = config.glarus;
				} else {
					timeEntry.resources[0].isExternal = false;
				}
			}

			return timeEntry;
		}

		/**
		 * Validate form data before insert or update.
		 * @return {boolean} Returns true if the form data is valid.
		 */
		function validateForm() {
			console.debug("Call to validateForm");
			var result = true;
			if (_.isNil($scope.form.staff)) {
				dialogService.info('operations.dialogs.invalidStaff');
				result = false;
			} else {
				if (_.isNil($scope.form.end) === false) {
					var begin = $scope.form.start;
					var end = $scope.form.end;
					if (begin.getTime() > end.getTime()) {
						dialogService.info('operations.dialogs.endDateError');
						result = false;
					}
				}
			}

			return result;
		}


		/**
		 * Calculate form dates.
		 */
		$scope.calculateDates = function () {
			console.debug("Call to calculateDates");
			// console.debug("Call to calculateDates");
			var startMoment = moment($scope.form.startForm);
			var endMoment = moment($scope.form.startForm);
			var startWorkMoment = moment($scope.form.startForm);
			var endWorkMoment = moment($scope.form.startForm);
			var differenceHoursMoment;
			var differenceHoursWorkMoment;
			var startTemp;
			var endTemp;

			// Billable dates.
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
			differenceHoursMoment = operationService.calculateDuration(startMoment.toDate(), endMoment.toDate());

			//Workable dates.
			startTemp = moment($scope.form.startHourWorkForm);
			startWorkMoment = startWorkMoment.hours(startTemp.hours()).minutes(startTemp.minutes());
			endTemp = moment($scope.form.endHourWorkForm);
			if (startTemp.hours() > endTemp.hours() || (startTemp.hours() === endTemp.hours() && endTemp.minutes() < startTemp.minutes())) {
				endWorkMoment = endWorkMoment.hours(endTemp.hours()).minutes(endTemp.minutes()).add(1, 'days');
			} else {
				endWorkMoment = endWorkMoment.hours(endTemp.hours()).minutes(endTemp.minutes());
			}
			differenceHoursWorkMoment = operationService.calculateDuration(startWorkMoment.toDate(), endWorkMoment.toDate());

			$scope.form.start = startMoment.toDate();
			$scope.form.end = endMoment.toDate();

			$scope.form.startWork = startWorkMoment.toDate();
			$scope.form.endWork = endWorkMoment.toDate();

			$scope.form.differenceTimeForm = differenceHoursMoment;
			$scope.form.differenceTimeWorkForm = differenceHoursWorkMoment;

		};

		/**
		 * Sets the selected staff record in the UI.
		 * Also, if the staff has a relation to an operation, also define the operation and the associated vehicle.
		 * The association with the operation and vehicle only occurs when the flag automaticOperationAndVehicleChange
		 * is marked as true.
		 * @param item
		 */
		$scope.staffSelectedItemChange = function (item) {
			console.debug("Call to staffSelectedItemChange");
			var filteredGuards;
			var operationId;
			var staffOperations;
			var selectedOperation;
			if (typeof item !== 'undefined' && automaticOperationAndVehicleChange === true) {
				// This item should contain the selected staff member
				console.debug('Item changed to ' + JSON.stringify(item));

				filteredGuards = _.filter(guardsAssignedToOperations, function (o) {
					return o.resource.id === item.resource.id;
				});

				if (filteredGuards.length === 0) {
					$scope.form.operation = undefined;
				} else {

					var candidateOperations = _.filter(operation, function (o) {
						return _.find(filteredGuards, function (it) {
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
					selectedGuard = _.find(guardsAssignedToOperations, function (o) {
						return o.opId === selectedOperation.id;
					});

					// Setting the associated person.
					operationId = selectedOperation.id;
					staffOperations = _.filter(operation, {id: operationId});

					console.debug('Selected staff operations', staffOperations);
					$scope.form.operation = staffOperations[0];

				}
			} else {
				// This means that the entered search text is empty or doesn't match any staff member
				console.debug("Not item changed, maybe the flag is marked as false or the user selected a blank record");
			}
		};

		$scope.staffSearch = function (query) {
			console.debug("Call to staffSearch");
			return query ? allGuards.filter(nameQueryService.createFilterForStaff(query)) : allGuards;
		};


		function createFilterForOps(query) {
			console.debug("Call to createFilterForOps");
			return function filterFn(operation) {
				return operation.name.toLowerCase().includes(query.toLowerCase());
			};
		}

		$scope.opsSearch = function (query) {
			console.debug("Call to opsSearch");
			return query ? operation.filter(createFilterForOps(query)) : operation;
		};

		/**
		 * This method is called when the user has modified the form information in the side panel and wants to insert
		 * or update.
		 */
		$scope.acceptTimeEntry = function () {
			if (validateForm()) {
				var timeEntryToSend = getFormData();
				if (_.isNil($scope.timeEntryUpdate)) {
					console.debug('Time entry to insert %o', timeEntryToSend);
					// Perform an insert
					timeEntryService.insert(timeEntryToSend).then(function () {
						// Send a notification the update was successful.
						$rootScope.$broadcast(config.timeEntry.attendance.events.doneInsertOrUpdate);
						// Close the panel.
						$mdSidenav(config.timeEntry.attendance.sidePanel.id).toggle();
					});
				} else {
					// Add the id and perform an update
					timeEntryToSend.id = $scope.timeEntryUpdate.id;
					console.debug('Time entry to update %o', timeEntryToSend);
					timeEntryService.update(timeEntryToSend).then(function () {
						// Send a notification the update was successful.
						$rootScope.$broadcast(config.timeEntry.attendance.events.doneInsertOrUpdate);
						// Close the panel.
						$mdSidenav(config.timeEntry.attendance.sidePanel.id).toggle();
					});
				}
			}
		};

		$scope.toggleSideNav = function () {
			$mdSidenav(config.timeEntry.attendance.sidePanel.id).toggle();
		};

		/*****
		 * EVENTS:
		 * The following events are defined in order so set the form.
		 ****/

		/**
		 * This even is captured
		 */
		$rootScope.$on(config.timeEntry.attendance.events.setInsertMode, function () {
			console.debug("Catch %s event", config.timeEntry.attendance.events.setInsertMode);
			clearForm();
			$mdSidenav(config.timeEntry.attendance.sidePanel.id).open();
		});

		/**
		 * When this event is captured, the form shows the selected data to update.
		 */
		$rootScope.$on(config.timeEntry.attendance.events.setUpdateMode, function (event, timeEntry) {
			console.debug("Catch event %s with timeEntry %o", config.timeEntry.attendance.events.setUpdateMode, timeEntry);
			clearForm();
			fillFormDataForUpdate(timeEntry);
			$mdSidenav(config.timeEntry.attendance.sidePanel.id).open();
		});

		/*****
		 * END EVENTS:
		 ****/

		$scope.init = function () {
			console.debug("Call to init");
			operationService.findStaffAndOperationAttendance()
				.then(function (driversAndOps) {
					allGuards = driversAndOps.allPersonnelAvailableForSelection;
					guardsAssignedToOperations = driversAndOps.guardsAssignedToOperations;
					operation = driversAndOps.operation;
				});

			if (_.isNil(sidenavInstance)) {
				sidenavInstance = $mdSidenav(config.timeEntry.attendance.sidePanel.id, true);
				if (_.isFunction(sidenavInstance.then)) {
					sidenavInstance.then(function (instance) {
						instance.onClose(function () {
							$scope.timeEntryUpdate = undefined;
							console.debug('Sending close');
							// $scope.gridOptions.api.stopEditing();
							$rootScope.$broadcast(config.timeEntry.attendance.events.canceled);
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
			$scope.bigpanel = !$scope.bigpanel;
		};

		$scope.init();
	}]
;
