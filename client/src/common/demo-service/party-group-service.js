/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 12/28/17.
 */
'use strict';
var Person = require('janux-people').Person;
var Organization = require('janux-people').Organization;
var _ = require('lodash');

module.exports =
	['$q', '$http', 'dateUtilService', 'partyService', '$log',
		function ($q, $http, dateUtilService, partyService, $log) {

			/**
			 * Convert a json object to a PartyAbstract instance.
			 * @param object
			 */
			function fromJSON(object) {
				if (_.isNil(object)) return object;
				const result = _.cloneDeep(object);
				result.values = _.map(result.values, function (it) {
					return fromJSONItem(it);
				});
				return result;
			}

			function fromJSONItem(item) {
				if (_.isNil(item)) return item;
				const result = _.cloneDeep(item);
				result.party = partyService.fromJSON(result.party);
				return result;
			}

			function toJSONItem(item) {
				if (_.isNil(item)) return item;
				const result = _.cloneDeep(item);
				result.party = partyService.toJSON(result.party);
				return result;
			}

			/**
			 * Convert a PartyAbstract instance to a JSON object.
			 * @param object
			 */
			function toJSON(object) {
				if (_.isNil(object)) return object;
				const result = _.cloneDeep(object);
				result.values = _.map(result.values, function (o) {
					return toJSONItem(o);
				});
				return result;
			}

			var service = {


				findPropertiesByType: function (type) {
					$log.debug("Call to findPropertiesByType with " + type);
					return $http.jsonrpc(
						'/rpc/2.0/partyGroupService',
						'findPropertiesByType',
						[type]
					).then(function (resp) {
						return resp.data.result;
					});
				},

				findPropertiesOwnedByPartyAndTypes: function (partyId, types) {
					$log.debug("Call to findPropertiesOwnedByPartyAndTypes with " + partyId + " and type " + types);
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
						return _.map(resp.data.result, function (it) {
							return fromJSON(it);
						});
					});
				},


				insert: function (partyId, group) {
					$log.debug("Call to insert with " + partyId + "and " + group);
					return $http.jsonrpc(
						'/rpc/2.0/partyGroupService',
						'insert',
						[partyId, toJSON(group)]
					).then(function (resp) {
						return fromJSON(resp.data.result);
					});
				},

				update: function (group) {
					$log.debug("Call to update with " + +group);
					return $http.jsonrpc(
						'/rpc/2.0/partyGroupService',
						'update',
						[toJSON(group)]
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
					$log.debug("Call to addItem with " + code + " item " + item);
					return $http.jsonrpc(
						'/rpc/2.0/partyGroupService',
						'addItem',
						[code, toJSONItem(item)]
					).then(function (resp) {
						return resp.data.result;
					});
				},

				removeItem: function (code, partyId) {
					$log.debug("Call to removeItem with " + code + " partyId " + partyId);
					return $http.jsonrpc(
						'/rpc/2.0/partyGroupService',
						'removeItem',
						[code, partyId]
					).then(function (resp) {
						return resp.data.result;
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
