/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 10/31/17.
 */
'use strict';

var _ = require('lodash');

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

				// Map an operation record to a easy-to show ag-grid row
				mapData: function (record) {
					record = _.cloneDeep(record);
					return record;
				}
			};
			return service;
		}];