/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 11/21/17.
 */


var _ = require('lodash');


module.exports =
	['$q', '$http', 'partyService', 'resourceService', 'dateUtilService', '$log', 'FileSaver', 'Blob', 'localStorageService', '$modal', '$filter',
		function ($q, $http, partyService, resourceService, dateUtilService, $log, FileSaver, Blob, localStorageService, $modal, $filter) {

			var errorMessageCantUpdate = 'Can\'t update invoice idOperation given this record is associated with an invoice';

			//Generate a time-entry instance from a json object
			function fromJSON(object) {
				if (_.isNil(object)) return object;
				var result = _.clone(object);

				result.begin = dateUtilService.stringToDate(result.begin);
				result.end = dateUtilService.stringToDate(result.end);
				result.beginWork = dateUtilService.stringToDate(result.beginWork);
				result.endWork = dateUtilService.stringToDate(result.endWork);
				result.principals = _.map(result.principals, function (o) {
					return partyService.fromJSON(o);
				});
				result.resources = _.map(result.resources, function (o) {
					return resourceService.fromJSON(o);
				});

				if (result.resources.length === 0) {
					$log.warn("Time entry " + result.id + "has zero resources");
				}

				return result;
			}

			function toJSON(object) {
				if (_.isNil(object)) return object;
				var result = _.clone(object);

				result.principals = _.map(result.principals, function (o) {
					return partyService.toJSON(o);
				});
				result.resources = _.map(result.resources, function (o) {
					// return resourceService.toJSON(o);
					return resourceService.toJSON(o);
				});
				return result;
			}

			function infoDialog(translateKey) {
				$modal.open({
					templateUrl: 'app/dialog-tpl/info-dialog.html',
					controller : ['$scope', '$modalInstance',
						function ($scope, $modalInstance) {
							$scope.message = $filter('translate')(translateKey);

							$scope.ok = function () {
								$modalInstance.close();
							};
						}],
					size       : 'md'
				});
			}

			/**
			 * Send an info dialog for the expected error messages.
			 * For the moment there is only one server message
			 * necessary to show.
			 * @param err
			 */
			function handleErrorMessage(err) {
				var message;
				var error = err.data.error;
				if (_.isArray(error) && error.length > 0) {
					message = error[0].message;
					if (message === errorMessageCantUpdate) {
						infoDialog('operations.errorMessages.cantUpdateDueInvoiceAssociation');
					}
				}
				return $q.reject(err);
			}

			var service = {
				insert     : function (timeEntry) {
					return $http.jsonrpc(
						'/rpc/2.0/timeEntry',
						'insert',
						[toJSON(timeEntry)]
					).then(function (resp) {
						return fromJSON(resp.data.result);
					});
				},
				update     : function (timeEntry) {
					return $http.jsonrpc(
						'/rpc/2.0/timeEntry',
						'update',
						[toJSON(timeEntry)]
					).then(function (resp) {
						return fromJSON(resp.data.result);
					}, function (err) {
						// $log.error("Error updating timeEntryService " + JSON.stringify(err));
						return handleErrorMessage(err);
					});
				},
				removeByIds: function (ids) {
					return $http.jsonrpc(
						'/rpc/2.0/timeEntry',
						'removeByIds',
						[ids]
					).then(function (resp) {
						return resp.data.result;
					}, function (err) {
						return handleErrorMessage(err);
					});
				},

				fromJSON: function (object) {
					return fromJSON(object);
				},

				toJSON: function (object) {
					return toJSON(object);
				},

				timeEntryReport: function (ids) {
					var headers = {
						'Content-type': 'application/json',
						'Accept'      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
					};

					var token = localStorageService.get("token");
					var timeZone = dateUtilService.getBrowserTimeZone();

					if (_.isNil(token) === false) {
						headers['Authorization'] = 'Bearer ' + token
					}

					$http({
						url         : '/report/time-entry-report',
						method      : 'POST',
						responseType: 'arraybuffer',
						data        : {ids: ids, timeZone: timeZone},
						headers     : headers
					}).then(function (result) {
						var now = moment();
						var blob = new Blob([result.data], {
							type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
						});
						FileSaver.saveAs(blob, 'bitacora ' + now.format('YYYYMMDDHHmm') + '.xlsx');
					});
				},

				timeEntryReportGuard: function (ids) {
					var headers = {
						'Content-type': 'application/json',
						'Accept'      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
					};

					var token = localStorageService.get("token");
					var timeZone = dateUtilService.getBrowserTimeZone();

					if (_.isNil(token) === false) {
						headers['Authorization'] = 'Bearer ' + token
					}

					$http({
						url         : '/report/time-entry-report-guard',
						method      : 'POST',
						responseType: 'arraybuffer',
						data        : {ids: ids, timeZone: timeZone},
						headers     : headers
					}).then(function (result) {
						var now = moment();
						var blob = new Blob([result.data], {
							type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
						});
						FileSaver.saveAs(blob, 'bitacora-guardias' + now.format('YYYYMMDDHHmm') + '.xlsx');
					});
				},

				timeEntryReportAttendance: function (ids) {
					var headers = {
						'Content-type': 'application/json',
						'Accept'      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
					};

					var token = localStorageService.get("token");
					var timeZone = dateUtilService.getBrowserTimeZone();

					if (_.isNil(token) === false) {
						headers['Authorization'] = 'Bearer ' + token
					}

					$http({
						url         : '/report/time-entry-report-attendance',
						method      : 'POST',
						responseType: 'arraybuffer',
						data        : {ids: ids, timeZone: timeZone},
						headers     : headers
					}).then(function (result) {
						var now = moment();
						var blob = new Blob([result.data], {
							type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
						});
						FileSaver.saveAs(blob, 'bitacora-asistencia' + now.format('YYYYMMDDHHmm') + '.xlsx');
					});
				},

				timeEntryReportSpecialOps: function (ids) {
					var headers = {
						'Content-type': 'application/json',
						'Accept'      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
					};

					var token = localStorageService.get("token");
					var timeZone = dateUtilService.getBrowserTimeZone();

					if (_.isNil(token) === false) {
						headers['Authorization'] = 'Bearer ' + token
					}

					$http({
						url         : '/report/time-entry-report-special-ops',
						method      : 'POST',
						responseType: 'arraybuffer',
						data        : {ids: ids, timeZone: timeZone},
						headers     : headers
					}).then(function (result) {
						var now = moment();
						var blob = new Blob([result.data], {
							type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
						});
						FileSaver.saveAs(blob, 'bitacora-especiales' + now.format('YYYYMMDDHHmm') + '.xlsx');
					});
				}
			};
			return service;
		}];
