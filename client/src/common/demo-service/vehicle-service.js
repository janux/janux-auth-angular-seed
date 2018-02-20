'use strict';

var _ = require('lodash');

module.exports =
	['$q', '$http',
		function ($q, $http) {
			var service = {

				findAll: function () {
					return $http.jsonrpc(
						'/rpc/2.0/vehicleService',
						'findAll'
					).then(function (resp) {
						return resp.data.result;
					});
				}


			};
			return service;
		}];