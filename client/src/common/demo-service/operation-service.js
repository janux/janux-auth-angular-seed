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
				object.client = partyService.fromJSON(object.client);
				object.dateCreated = dateUtilService.stringToDate(object.dateCreated);
				object.lastUpdate = dateUtilService.stringToDate(object.lastUpdate);
				object.currentResources = _.map(object.currentResources, function (o) {
					return resourceService.fromJSON(o);
				});

				object.schedule = _.map(object.schedule, function (o) {
					return timeEntryService.fromJSON(o);
				});

				return object;
			}

			function toJSON(object) {
				object.client = partyService.toJSON(object.client);
				object.currentResources = _.map(object.currentResources, function (o) {
					return resourceService.toJSON(o);
				});

				object.schedule = _.map(object.schedule, function (o) {
					return timeEntryService.toJSON(o);
				});
				return object;
			}

			var service = {

				findAll: function () {
					return $http.jsonrpc(
						'/rpc/2.0/operation',
						'findAll'
					).then(function (resp) {
						return fromJSON(resp.data.result);
					});
				},

				findAllWithoutTimeEntry: function () {
					return $http.jsonrpc(
						'/rpc/2.0/operation',
						'findAllWithoutTimeEntry'
					).then(function (resp) {
						return fromJSON(resp.data.result);
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
								duration = durationMoment.get("hours") + ":" + durationMoment.get("minutes");
								endOnlyHour = end.format(formatStringOnlyHour);
								end = end.format(dateTimeFormatString);
							}

							result.push({
								client       : operation.client.name,
								id           : timeEntry.id,
								operation    : operation,
								staff        : timeEntry.resources[0],
								begin        : begin.format(dateTimeFormatString),
								beginOnlyHour: begin.format(formatStringOnlyHour),
								beginOnlyDate: begin.format(formatStringOnlyDate),
								endOnlyHour  : endOnlyHour,
								end          : end,
								duration     : duration,
								absence      : timeEntry.resources[0].absence,
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