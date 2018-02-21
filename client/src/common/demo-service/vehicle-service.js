'use strict';

var _ = require('lodash');

module.exports =
	['$q', '$http',
		function ($q, $http) {

			function mapData(vehicles) {
				return _.map(vehicles, function (o) {
					o.displayName = o.name + " " + o.year + " " + o.color;
					return o;
				});
			}

			var service = {

				findAll: function () {
					return $http.jsonrpc(
						'/rpc/2.0/vehicleService',
						'findAll'
					).then(function (resp) {
						return mapData(resp.data.result);
					});
				}

			};
			return service;
		}];