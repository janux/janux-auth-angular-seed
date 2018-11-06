/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 10/31/17.
 */
'use strict';

var _ = require('lodash');
var moment = require('moment');


module.exports =
	['config', 'dialogService', '$timeout', 'timeEntryService',
		function (config, dialogService, $timeout, timeEntryService) {

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

			function isInvalidOdometerValues(specialOpsTimeEntry) {
				return !_.isNil(specialOpsTimeEntry.resources[1].odometerEnd) && !_.isNil(specialOpsTimeEntry.resources[1].odometerStart) &&
					_.toNumber(specialOpsTimeEntry.resources[1].odometerStart) > _.toNumber(specialOpsTimeEntry.resources[1].odometerEnd);
			}

			/**
			 * Validate form data before insert.
			 * @param $scope
			 * @return {boolean}
			 */
			function validateBeforeInsert($scope) {
				var result = true;

				// Selected person
				if (!$scope.lbRow.staff) {
					dialogService.info('operations.dialogs.invalidStaff', false);
					result = false;
				} else if (!$scope.lbRow.operation && !$scope.operationId) {
					// Selected operation.
					dialogService.info('operations.dialogs.invalidOperation', false);
					result = false;
				} else if (!$scope.lbRow.function) {
					// Selected function.
					dialogService.info('operations.dialogs.invalidFunction', false);
					result = false;
				} else if (!_.isDate($scope.lbRow.startForm)) {
					dialogService.info('operations.dialogs.invalidStartDateForm', false);
					result = false;
				} else if (!_.isNil($scope.lbRow.odometerEnd) && !_.isNil($scope.lbRow.odometerStart) &&
					// Validating odometer values.
					_.toNumber($scope.lbRow.odometerStart) > _.toNumber($scope.lbRow.odometerEnd)) {
					dialogService.info('operations.dialogs.odometerStartGreaterThanEnd', false);
					result = false;
				} else if (!_.isDate($scope.lbRow.start)) {
					dialogService.info('operations.dialogs.beginDateError', false);
					result = false;
				} else {
					var begin = $scope.lbRow.start;
					var end = $scope.lbRow.end;
					if (_.isNil($scope.lbRow.end) === false) {
						if (begin > end) {
							dialogService.info('operations.dialogs.endDateError', false);
							result = false;
						}
					}
				}


				/// ?
				// if (!!$scope.specialServiceAddForm.$valid) {
				//
				// }

				return result;
			}

			/**
			 * This service encapsulate common methods in the time sheets with the purpose to remove duplicated code.
			 */
			var service = {

				/**************************
				 *Special ops util methods
				 *************************/
				createAndInsertSpecialOpsTimeEntry: function ($scope, initRowModel) {
					var vehicle;
					if (validateBeforeInsert($scope)) {

						var specialOpsTimeEntryToInsert = {
							'resources'  : [_.clone($scope.lbRow.staff)],
							'principals' : [],
							'attributes' : [],
							'type'       : 'SPECIAL_OPS',
							'comment'    : $scope.lbRow.location,
							'begin'      : $scope.lbRow.start,
							'end'        : $scope.lbRow.end,
							'beginWork'  : $scope.lbRow.startWork,
							'endWork'    : $scope.lbRow.endWork,
							'billable'   : true,
							'idOperation': $scope.operationId || $scope.lbRow.operation.id
						};

						specialOpsTimeEntryToInsert.resources[0].type = $scope.lbRow.function;
						specialOpsTimeEntryToInsert.resources[0] = setExtraFlagSpecialOpsTimeEntries(specialOpsTimeEntryToInsert.resources[0]);
						specialOpsTimeEntryToInsert = setTransportFlag(specialOpsTimeEntryToInsert);

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
				},

				/**
				 * Creates a default special ops time entry for update.
				 * @param rowObj
				 * @return object Time entry or undefined if there are invalid values.
				 */
				createSpecialOpsTimeEntryForUpdate: function (rowObj) {
					var endToUpdate;

					if (rowObj.data.end) {
						endToUpdate = moment(rowObj.data.end).toDate();
					}

					var resource = _.clone(rowObj.data.staff);
					// TODO: Temporary solution, remove once we obtain the list of operations and staff separately
					delete resource.opId;

					var specialOpsTimeEntryToUpdate = {
						'id'         : rowObj.data.id,
						'resources'  : [_.clone(resource)],
						'principals' : [],
						'attributes' : [],
						'type'       : 'SPECIAL_OPS',
						'comment'    : rowObj.data.comment,
						'begin'      : moment(rowObj.data.begin).toDate(),
						'end'        : endToUpdate,
						'billable'   : true,
						'idOperation': rowObj.data.operation.id
					};

					specialOpsTimeEntryToUpdate.resources[0].type = rowObj.data.functionValue;
					specialOpsTimeEntryToUpdate.resources[0] = setExtraFlagSpecialOpsTimeEntries(specialOpsTimeEntryToUpdate.resources[0]);
					specialOpsTimeEntryToUpdate = setTransportFlag(specialOpsTimeEntryToUpdate);
					if (!_.isNil(rowObj.data.vehicle)) {
						specialOpsTimeEntryToUpdate.resources[1] = _.clone(rowObj.data.vehicle);
						if (isInvalidOdometerValues(specialOpsTimeEntryToUpdate)) {
							dialogService.info('operations.dialogs.odometerStartGreaterThanEnd', false);
							specialOpsTimeEntryToUpdate = undefined;
						}
					}
					return specialOpsTimeEntryToUpdate;
				}
			};
			return service;
		}];
