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

				findAll: function () {
					return $http.jsonrpc(
						'/rpc/2.0/operation',
						'findAll'
					).then(function (resp) {
						return _.map(resp.data.result, function (o) {
							return fromJSON(o);
						});
					});
				},

				findByDateBetweenWithTimeEntries: function (initDate, endDate) {
					return $http.jsonrpc(
						'/rpc/2.0/operation',
						'findByDateBetweenWithTimeEntries',
						[initDate, endDate]
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
								duration = (durationMoment.get("hours") + daysToHours) + ":" + durationMoment.get("minutes");
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
								comment      : timeEntry.comment
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