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
	['$q', '$http', 'partyService', 'timeEntryService', 'resourceService', 'dateUtilService',
		function ($q, $http, partyService, timeEntryService, resourceService, dateUtilService) {

			function fromJSON(object) {
				if (_.isNil(object)) return object;
				var result = _.cloneDeep(object);

				result.client = partyService.fromJSON(result.client);
				result.dateCreated = dateUtilService.stringToDate(result.dateCreated);
				result.lastUpdate = dateUtilService.stringToDate(result.lastUpdate);
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
				result.currentResources = _.map(result.currentResources, function (o) {
					return resourceService.toJSON(o);
				});

				result.schedule = _.map(result.schedule, function (o) {
					return timeEntryService.toJSON(o);
				});
				return result;
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

				findGuardsAndOperations: function () {
					return service.findAllWithoutTimeEntry().then(function (result) {
						var guardsAssignedToOperations = [];
						var operations = [];
						result.forEach(function (op) {
							var tmpRes = _.filter(op.currentResources, {type: 'GUARD'});

							// If the operation has at least one driver
							if (tmpRes.length > 0) {
								tmpRes.forEach(function (res, resId) {
									tmpRes[resId].opId = op.id;
								});

								var opWithOutRes = _.clone(op);
								delete opWithOutRes.currentResources;
								guardsAssignedToOperations = guardsAssignedToOperations.concat(tmpRes);
								operations = operations.concat(opWithOutRes);
							}
						});

						return resourceService.findAvailableResources().then(function (result) {

							// Filter only persons.
							result = _.filter(result, function (o) {
								return o.type !== 'VEHICLE';
							});

							return {
								guardsAssignedToOperations: guardsAssignedToOperations,
								guards                    : result,
								operations                : operations
							};
						});
					});
				},

				findDriversAndOperations: function () {
					return service.findAllWithoutTimeEntry().then(function (result) {
						var driversAssignedToOperations = [];
						var operations = [];
						result.forEach(function (op) {
							var tmpRes = _.filter(op.currentResources, {type: 'DRIVER'});

							// If the operation has at least one driver
							if (tmpRes.length > 0) {
								tmpRes.forEach(function (res, resId) {
									tmpRes[resId].opId = op.id;
								});

								var opWithOutRes = _.clone(op);
								delete opWithOutRes.currentResources;
								driversAssignedToOperations = driversAssignedToOperations.concat(tmpRes);
								operations = operations.concat(opWithOutRes);
							}
						});

						return resourceService.findAvailableResources().then(function (result) {

							// Filter only persons and resources that belongs to glarus.
							result = _.filter(result, function (o) {
								return o.type !== 'VEHICLE' && o.vendor.id === '10000';
							});

							return {
								driversAssignedToOperations: driversAssignedToOperations,
								drivers                    : result,
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

							var duration = '0:0';
							var end = '', endOnlyHour = '';

							if (_.isNil(timeEntry.end) === false) {
								end = moment(timeEntry.end);
								var durationMoment = moment.duration(end.diff(begin));
								var daysToHours = (durationMoment.get("days") > 0) ? durationMoment.get("days") * 24 : 0;
								duration = (durationMoment.get("hours") + daysToHours) + ":" + ('00' + durationMoment.get("minutes")).slice(-2);
								endOnlyHour = end.format(formatStringOnlyHour);
								end = end.format(dateTimeFormatString);
							}
							// Temporary solution to mark records without absence
							var absence = (!_.isNil(timeEntry.resources[0].absence) && timeEntry.resources[0].absence !== '') ?
								timeEntry.resources[0].absence : 'SF';
							// var absence = timeEntry.resources[0].absence;

							result.push({
								client       : operation.client.name,
								id           : timeEntry.id,
								operation    : operation,
								staff        : timeEntry.resources[0],
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

				fromJSON: function (object) {
					return fromJSON(object);
				},

				toJSON: function (object) {
					return toJSON(object);
				}

			};
			return service;
		}];