/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 12/4/17.
 */
'use strict';
var _ = require('lodash');

module.exports =
	['$q', '$http', '$log', 'partyService',
		function ($q, $http, $log, partyService) {

			function fromJSON(object) {

				if (_.isNil(object)) return object;

				var result = _.clone(object);
				result.values = _.map(result.values, function (o) {
					o.party = partyService.fromJSON(o.party);
					return o;
				});

				return result;
			}

			var service = {

				findPropertiesByType: function (type) {
					$log.debug("Call to findPropertiesByType with type" + type);
					return $http.jsonrpc(
						'/rpc/2.0/partyGroupService',
						'findPropertiesByType',
						[type]
					).then(function (resp) {
						return resp.data.result;
					});
				},

				findPropertiesOwnedByPartyAndTypes: function (partyId, types) {
					$log.debug("Call to findPropertiesOwnedByPartyAndTypes with " + partyId + " and " + types);
					return $http.jsonrpc(
						'/rpc/2.0/partyGroupService',
						'findPropertiesOwnedByPartyAndTypes',
						[partyId, types]
					).then(function (resp) {
						return resp.data.result;
					});
				},

				findOne: function (code) {
					$log.debug("Call to findOne with " + code);
					return $http.jsonrpc(
						'/rpc/2.0/partyGroupService',
						'findOne',
						[code]
					).then(function (resp) {
						return fromJSON(resp.data.result);
					});
				},

				findOneOwnedByPartyAndType: function (partyId, type) {
					$log.debug("Call to findOneOwnedByPartyAndType with " + partyId + " and " + type);
					return $http.jsonrpc(
						'/rpc/2.0/partyGroupService',
						'findOneOwnedByPartyAndType',
						[partyId, type]
					).then(function (resp) {
						return fromJSON(resp.data.result);
					});
				},

				findByTypes: function (types) {
					$log.debug("Call to findByTypes with " + types);
					return $http.jsonrpc(
						'/rpc/2.0/partyGroupService',
						'findByTypes',
						[types]
					).then(function (resp) {
						return _.map(resp.data.result, function (o) {
							return fromJSON(o);
						});
					});
				},

				insert: function (group) {
					$log.debug("Call to insert with " + group);
					return $http.jsonrpc(
						'/rpc/2.0/partyGroupService',
						'insert',
						[group]
					).then(function (resp) {
						return fromJSON(resp.data.result);
					});
				},

				update: function (group) {
					$log.debug("Call to update with " + group);
					return $http.jsonrpc(
						'/rpc/2.0/partyGroupService',
						'update',
						[group]
					).then(function (resp) {
						return fromJSON(resp.data.result);
					});
				},


				remove: function (code) {
					$log.debug("Call to remove with " + code);
					return $http.jsonrpc(
						'/rpc/2.0/partyGroupService',
						'remove',
						[code]
					).then(function (resp) {
						return resp.data.result;
					});
				},

				addItem: function (code, item) {
					$log.debug("Call to addItem with " + code + " and " + item);
					return $http.jsonrpc(
						'/rpc/2.0/partyGroupService',
						'addItem',
						[code, item]
					).then(function (resp) {
						return resp.data.result;
					});
				},

				removeItem: function (code, party) {
					$log.debug("Call to removeItem with " + code + " and " + party);
					return $http.jsonrpc(
						'/rpc/2.0/partyGroupService',
						'removeItem',
						[code, party]
					).then(function (resp) {
						return resp.data.result;
					});
				}

			};
			return service;
		}];
