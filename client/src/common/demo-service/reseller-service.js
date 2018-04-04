'use strict';
var _ = require('lodash');

module.exports =
	['$q', '$http', 'partyGroupService', '$log',
		function ($q, $http, partyGroupService, $log) {

			/**
			 * Convert a json object to a PartyAbstract instance.
			 * @param object
			 */
			function fromJSON(object) {
				return partyGroupService.fromJSON(object);
			}


			var service = {

				findResellerContactsByClient: function (idClient) {
					$log.debug("Call to findResellerContactsByClient with " + idClient);
					return $http.jsonrpc(
						'/rpc/2.0/resellerService',
						'findResellerContactsByClient',
						[idClient]
					).then(function (resp) {
						return fromJSON(resp.data.result);
					});
				},

				fromJSON: function (object) {
					return fromJSON(object);
				}
			};
			return service;
		}];
