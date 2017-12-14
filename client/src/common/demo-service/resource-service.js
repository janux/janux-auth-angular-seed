/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 12/11/17.
 */

'use strict';

var _ = require('lodash');

module.exports =
	['$q', '$http', 'partyService',
		function ($q, $http, partyService) {

			const RESOURCE_VEHICLE = "VEHICLE";
			const RESOURCE_DRIVER = "DRIVER";
			const RESOURCE_GUARD = "GUARD";

			function fromJSON(object) {
				if(_.isNil(object)) return object;
				var result = _.clone(object);
				if (result.type !== RESOURCE_VEHICLE) {
					result.resource = partyService.fromJSON(result.resource);
				}
				result.vendor = partyService.fromJSON(result.vendor);


				return result;
			}

			function toJSON(object) {
				if(_.isNil(object)) return object;
				var result = _.clone(object);
				if (result.type !== RESOURCE_VEHICLE) {
					result.resource = partyService.toJSON(result.resource);
				}
				result.vendor = partyService.toJSON(result.vendor);
				return result;
			}


			var service = {

				findAvailableResources: function () {
					return $http.jsonrpc(
						'/rpc/2.0/resourceService',
						'findAvailableResources'
					).then(function (resp) {
						return _.map(resp.data.result, function (o) {
							return fromJSON(o);
						});
					});
				},

				fromJSON: function (object) {
					return fromJSON(object)
				},

				toJSON: function (object) {
					return toJSON(object)
				}

			};
			return service;
		}];