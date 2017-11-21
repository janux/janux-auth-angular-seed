/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 10/31/17.
 */
'use strict';

var _ = require('lodash');
var moment = require('moment');
var Person = require('janux-people').Person;
var agGridComp = require('common/ag-grid-components');
var dateTimeFormatString = agGridComp.dateTimeCellEditor.formatString;


module.exports =
	['$q', '$http',
		function ($q, $http) {
			var service = {

				findAll: function () {
					return $http.jsonrpc(
						'/rpc/2.0/operation',
						'findAll'
					).then(function (resp) {
						return resp.data.result;
					});
				},

				findAllWithoutTimeEntry: function () {
					return $http.jsonrpc(
						'/rpc/2.0/operation',
						'findAllWithoutTimeEntry'
					).then(function (resp) {
						return resp.data.result;
					});
				},

				// Map an operation record to a easy-to show ag-grid row
				mapTimeEntryData: function (record) {
					var result = [];
					for (var i = 0; i < record.length; i++) {
						var operation = record[i];
						for (var j = 0; j < operation.schedule.length; j++) {
							var timeEntry = operation.schedule[j];
							var staff = Person.fromJSON(timeEntry.resources[0].resource);
							var begin = moment(timeEntry.begin);
							var end = moment(timeEntry.end);
							var durationMoment = moment.duration(end.diff(begin));
							var duration = durationMoment.get("hours") + ":" + durationMoment.get("minutes");
							result.push({
								client: operation.client.name,
								id: timeEntry.id,
								name: operation.name,
								staff: staff.name.longName,
								begin: begin.format(dateTimeFormatString),
								end: end.format(dateTimeFormatString),
								duration: duration,
								absence: timeEntry.resources[0].absence,
								comment: timeEntry.comment
							});
						}
					}
					return result;
				}
			};
			return service;
		}];