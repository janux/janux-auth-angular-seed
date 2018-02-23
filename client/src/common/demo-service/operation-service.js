/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 10/31/17.
 */
'use strict';

var _ = require('lodash');
var moment = require('moment');
var agGridComp = require('common/ag-grid-components');
var dateTimeFormatString = agGridComp.dateTimeCellEditor.formatString;
var formatStringOnlyHour = agGridComp.dateTimeCellEditor.formatStringOnlyHour;
var formatStringOnlyDate = agGridComp.dateTimeCellEditor.formatStringOnlyDate;

module.exports =
	['$q', '$http', 'partyService', 'timeEntryService', 'resourceService', 'dateUtilService', function ($q, $http, partyService, timeEntryService, resourceService, dateUtilService) {

		function fromJSON(object) {
			if (_.isNil(object)) return object;
			var result = _.cloneDeep(object);

			result.client = partyService.fromJSON(result.client);
			result.dateCreated = dateUtilService.stringToDate(result.dateCreated);
			result.lastUpdate = dateUtilService.stringToDate(result.lastUpdate);
			result.start = dateUtilService.stringToDate(result.start);
			result.end = dateUtilService.stringToDate(result.end);
			result.interestedParty = partyService.fromJSON(result.interestedParty);
			result.principals = _.map(result.principals, function (o) {
				return partyService.fromJSON(o);
			});

			result.currentResources = _.map(result.currentResources, function (o) {
				return resourceService.fromJSON(o);
			});

			result.schedule = _.map(result.schedule, function (o) {
				return timeEntryService.fromJSON(o);
			});

			return result;
		}

		function toJSON(object) {
			if (_.isNil(object)) return object;
			var result = _.cloneDeep(object);
			result.client = partyService.toJSON(result.client);
			result.interestedParty = partyService.toJSON(result.interestedParty);
			result.currentResources = _.map(result.currentResources, function (o) {
				return resourceService.toJSON(o);
			});

			result.schedule = _.map(result.schedule, function (o) {
				return timeEntryService.toJSON(o);
			});
			return result;
		}

	function calculateDuration(begin, end) {
		var duration = '0:0';

		if (_.isNil(end) === false) {
			end = moment(end);
			var durationMoment = moment.duration(end.diff(begin));
			var daysToHours = (durationMoment.get("days") > 0) ? durationMoment.get("days") * 24 : 0;
			duration = (durationMoment.get("hours") + daysToHours) + ":" + ('00' + durationMoment.get("minutes")).slice(-2);
		}
		return duration;
	}

	var service = {

			findByDateBetweenWithTimeEntriesAndType: function (initDate, endDate, type) {
				return $http.jsonrpc(
					'/rpc/2.0/operation',
					'findByDateBetweenWithTimeEntriesAndType',
					[initDate, endDate, type]
				).then(function (resp) {
					return _.map(resp.data.result, function (o) {
						return fromJSON(o);
					});
				});
			},


			findAllWithoutTimeEntry: function () {
				return $http.jsonrpc(
					'/rpc/2.0/operation',
					'findAllWithoutTimeEntry'
				).then(function (resp) {
					return _.map(resp.data.result, function (o) {
						return fromJSON(o);
					});
				});
			},

			// Insert an operation
			insert: function (operation) {
				return $http.jsonrpc(
					'/rpc/2.0/operation',
					'insert',
					[toJSON(operation)]
				).then(function (resp) {
					return fromJSON(resp.data.result);
				});
			},

			// Update an operation
			update: function (operation) {
				return $http.jsonrpc(
					'/rpc/2.0/operation',
					'update',
					[operation]
				).then(function (resp) {
					return resp.data.result;
				});
			},

			findGuardsAndOperations: function () {
				return service.findAllWithoutTimeEntry().then(function (result) {
					var guardsAssignedToOperations = [];
					var operationsAvailableForSelection = [];
					result.forEach(function (op) {

						//Filter all resources associated with the operation marked as guards.
						var resourcesMarkedAsGuards = _.filter(op.currentResources, {type: 'GUARD'});
						if (resourcesMarkedAsGuards.length > 0) {
							resourcesMarkedAsGuards.forEach(function (res, resId) {
								resourcesMarkedAsGuards[resId].opId = op.id;
							});
							// Fill the list of guards assigned to an operation.
							// This list helps to auto-select an operation when the users selects a guard.
							guardsAssignedToOperations = guardsAssignedToOperations.concat(resourcesMarkedAsGuards);

						}

						//Only shows the operation marked as guards.
						if (op.type === "GUARD") {
							var opWithOutRes = _.clone(op);
							delete opWithOutRes.currentResources;
							operationsAvailableForSelection = operationsAvailableForSelection.concat(opWithOutRes);
						}


					});

					return resourceService.findAvailableResources().then(function (allGuardsAvailableForSelection) {

						// Filter only persons.
						allGuardsAvailableForSelection = _.filter(allGuardsAvailableForSelection, function (o) {
							return o.type !== 'VEHICLE';
						});

					return {
						guardsAssignedToOperations       : guardsAssignedToOperations,
						allPersonnelAvailableForSelection: allGuardsAvailableForSelection,
						operations                       : operationsAvailableForSelection
					};
				});
			});
		},

			findDriversAndOperations: function () {
				return service.findAllWithoutTimeEntry().then(function (result) {
					var driversAssignedToOperations = [];
					var operations = [];
					result.forEach(function (op) {
						var resourcesMarkedAsDrivers = _.filter(op.currentResources, {type: 'DRIVER'});

						// If the operation has at least one driver
						if (resourcesMarkedAsDrivers.length > 0) {
							resourcesMarkedAsDrivers.forEach(function (res, resId) {
								resourcesMarkedAsDrivers[resId].opId = op.id;
							});

							// Fill the list of drivers assigned to an operation.
							// This list helps to auto-select an operation when the users selects a driver.
							driversAssignedToOperations = driversAssignedToOperations.concat(resourcesMarkedAsDrivers);

						}

						// Only shows the operations marked as driver.
						if (op.type === "DRIVER") {
							var opWithOutRes = _.clone(op);
							delete opWithOutRes.currentResources;
							operations = operations.concat(opWithOutRes);
						}

					});

					return resourceService.findAvailableResources().then(function (allDriversAvailableForSelection) {

						// Filter only persons and resources that belongs to glarus.
						allDriversAvailableForSelection = _.filter(allDriversAvailableForSelection, function (o) {
							return o.type !== 'VEHICLE' && o.vendor.id === '10000';
						});

					return {
						driversAssignedToOperations      : driversAssignedToOperations,
						allPersonnelAvailableForSelection: allDriversAvailableForSelection,
						operations                       : operations
					};
				});
			});
		},

			findDriversAndSpecialOps: function () {
				return service.findAllWithoutTimeEntry().then(function (result) {
					var driversAssignedToOperations = [];
					var operations = [];
					result.forEach(function (op) {
						var resourcesMaskedAsSpecialOps = _.filter(op.currentResources, {type: 'SPECIAL_OPS'});

						// If the operation has at least one driver
						if (resourcesMaskedAsSpecialOps.length > 0) {
							resourcesMaskedAsSpecialOps.forEach(function (res, resId) {
								resourcesMaskedAsSpecialOps[resId].opId = op.id;
							});

							// Fill the list of drivers assigned to an operation.
							// This list helps to auto-select an operation when the users selects a driver.
							driversAssignedToOperations = driversAssignedToOperations.concat(resourcesMaskedAsSpecialOps);
						}


						if (op.type === "SPECIAL_OPS") {
							var opWithOutRes = _.clone(op);
							delete opWithOutRes.currentResources;
							operations = operations.concat(opWithOutRes);
						}

					});

					return resourceService.findAvailableResources().then(function (allResources) {

						// Filter only persons and resources that belongs to glarus.
						var allDriversAvailableForSelection = _.filter(allResources, function (o) {
							return o.type !== 'VEHICLE' && o.vendor.id === '10000';
						});

						var allVehiclesAvailableForSelection = _.filter(allResources, function (o) {
							return o.type === 'VEHICLE' && o.vendor.id === '10000';
						});


						return {
							driversAssignedToOperations: driversAssignedToOperations,
							drivers                    : allDriversAvailableForSelection,
							vehicles                   : allVehiclesAvailableForSelection,
							operations                 : operations
						};
					});
				});
			},

			// Map an operation record to a easy-to show ag-grid row
			mapTimeEntryData: function (record) {
				var result = [];
				for (var i = 0; i < record.length; i++) {
					var operation = record[i];
					for (var j = 0; j < operation.schedule.length; j++) {
						var timeEntry = operation.schedule[j];
						var begin = moment(timeEntry.begin);

					var duration = calculateDuration(timeEntry.begin, timeEntry.end);
					var end = '', endOnlyHour = '';

					if (_.isNil(timeEntry.end) === false) {
						end = moment(timeEntry.end);
						endOnlyHour = end.format(formatStringOnlyHour);
						end = end.format(dateTimeFormatString);
					}
					// Temporary solution to mark records without absence
					if( operation.type === 'DRIVER') {
						var absence = (!_.isNil(timeEntry.resources[0].absence) && timeEntry.resources[0].absence !== '') ?
							timeEntry.resources[0].absence : 'SF';
					}

						// Temporary solution for empty extras.
						if (operation.type === 'GUARD' && (_.isNil(timeEntry.extras) || timeEntry.extras === '')) {
							timeEntry.extras = 'BASE';
						}

						// Separating staff and vehicle.
						var staff = _.find(timeEntry.resources, function (o) {
							return o.type !== "VEHICLE"
						});

						// Separating vehicle.
						var vehicle = _.find(timeEntry.resources, function (o) {
							return o.type === "VEHICLE"
						});


						result.push({
							client       : operation.client.name,
							id           : timeEntry.id,
							operation    : operation,
							staff        : staff,
							vehicle      : vehicle,
							begin        : timeEntry.begin, //begin.format(dateTimeFormatString),
							beginOnlyHour: begin.format(formatStringOnlyHour),
							beginOnlyDate: begin.format(formatStringOnlyDate),
							endOnlyHour  : endOnlyHour,
							end          : timeEntry.end, //end,
							duration     : duration,
							absence      : absence,
							comment      : timeEntry.comment,
							extras       : timeEntry.extras
						});
					}
				}
				return result;
			},

		// Map operations properties in order to create a list with ag-grid or similar
		mapOperations: function (operations) {

			return _.map(operations, function (operation) {

				const duration = (!_.isNil(operation.start))?moment(operation.start).diff(moment(operation.end)):'';
				const start = (!_.isNil(operation.start))?moment(operation.start).format('YYYY-MM-DD'):'';
				const end = (!_.isNil(operation.end))?moment(operation.end).format('YYYY-MM-DD'):'';

				var assigned = '';
				if(operation.currentResources.length > 0 ){
					assigned = operation.currentResources[0].resource;
					assigned = assigned.name.last+' '+assigned.name.first;
				}

				return {
					id: operation.id,
					type: operation.type,
					name: operation.name,
					client: operation.client.name,
					assigned: assigned,
					duration: duration,
					start: start,
					end: end
				}
			});
		},

		fromJSON: function (object) {
			return fromJSON(object);
		},

		toJSON: function (object) {
			return toJSON(object);
		}

	};
	return service;
}];