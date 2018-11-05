/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 10/31/17.
 */
'use strict';

var _ = require('lodash');
var moment = require('moment');


module.exports =
	['config',
		function (config) {

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
			 * This service encapsulate common methods in the time sheets with the purpose to remove duplicated code.
			 */
			var service = {

				/**************************
				 *Special ops util methods
				 *************************/

				/**
				 * Creates and insert a special ops time entry.
				 * This method only helps to remove duplicated code
				 * @param infoDialog The infoDialog instance from the controller
				 * @param $modal The $modal reference from the controller.
				 * @param $scope The $scope from the controller
				 * @param timeEntryService  a TimeEntryService instance, from the controller
				 * @param $timeout The angular $timeout, from the controller
				 * @param initRowModel A method implemented in the controller that helps to create an empty form for new time entries.
				 */
				createAndInsertSpecialOpsTimeEntry: function (infoDialog, $modal, $scope, timeEntryService, $timeout, initRowModel, $filter) {

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
				 * @param infoDialog
				 * @return object Time entry or undefined if there are invalid values.
				 */
				createSpecialOpsTimeEntryForUpdate: function (rowObj, infoDialog) {
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
							infoDialog('operations.dialogs.odometerStartGreaterThanEnd');
							specialOpsTimeEntryToUpdate = undefined;
						}
					}

					return specialOpsTimeEntryToUpdate;

				}

			};
			return service;
		}];
