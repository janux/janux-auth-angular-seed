/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 10/31/17.
 */
'use strict';

var _ = require('lodash');



module.exports =
	['$q', '$http', 'partyService', 'timeEntryService', 'resourceService', 'dateUtilService', 'partyGroupService', 'security', 'config', '$filter','$log',
		function ($q, $http, partyService, timeEntryService, resourceService, dateUtilService, partyGroupService, security, config, $filter, $log) {

			var service = {

				getEnvironmentInfo:function () {
					return $http.jsonrpc(
						'/rpc/2.0/environment',
						'getEnvironmentInfo',
						[]
					).then(function (resp) {
						return resp.data.result;
					});
				}
			};
			return service;
		}];
