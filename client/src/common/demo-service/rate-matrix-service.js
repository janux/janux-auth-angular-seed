var _ = require('lodash');

module.exports =
	['$q', '$http', 'dateUtilService', 'partyService',
		function ($q, $http, dateUtilService, partyService) {

			/**
			 * Convert a json object to a PartyAbstract instance.
			 * @param object
			 */
			function fromJSON(object) {
				var result = _.cloneDeep(object);
				result.client = partyService.fromJSON(object.client);
				result.begin = dateUtilService.stringToDate(object.begin);
				result.end = dateUtilService.stringToDate(object.end);
				return result;
			}

			/**
			 * Convert a PartyAbstract instance to a JSON object.
			 * @param object
			 */
			function toJSON(object) {
				var result = _.cloneDeep(object);
				result.client = partyService.toJSON(object.client);
				return result;

			}

			var service = {

				findOrInsertDefaultRateMatrix: function (idClient) {
					return $http.jsonrpc(
						'/rpc/2.0/rateMatrixService',
						'findOrInsertDefaultRateMatrix',
						[idClient]
					).then(function (resp) {
						return fromJSON(resp.data.result);
					});
				},


				update: function (rateMatrix) {
					var objectToSend = toJSON(rateMatrix);
					return $http.jsonrpc(
						'/rpc/2.0/rateMatrixService',
						'update',
						[objectToSend]
					).then(function (resp) {
						var result = resp.data.result;
						result = fromJSON(result);
						return result;
					});
				},

				fromJSON: function (object) {
					return fromJSON(object);
				},

				toJSON: function (object) {
					return toJSON(object)
				}
			};
			return service;
		}];
