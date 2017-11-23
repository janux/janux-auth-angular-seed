/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 11/21/17.
 */


var _ = require('lodash');

module.exports =
	['$q', '$http',
		function ($q, $http) {
			var service = {
				insert: function (timeEntry) {
					return $http.jsonrpc(
						'/rpc/2.0/timeEntry',
						'insert',
						[timeEntry]
					).then(function (resp) {
						return resp.data.result;
					});
				},
				update: function (timeEntry) {
					return $http.jsonrpc(
						'/rpc/2.0/timeEntry',
						'update',
						[timeEntry]
					).then(function (resp) {
						return resp.data.result;
					});
				}
			};
			return service;
		}];
