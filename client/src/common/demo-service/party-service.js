/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 11/23/17.
 */
'use strict';

var Person = require('janux-people').Person;
var Organization = require('janux-people').Organization;
var _ = require('lodash');


module.exports =
	['$q', '$http', 'dateUtilService', '$log',
		function ($q, $http, dateUtilService, $log) {

			/**
			 * Convert a json object to a PartyAbstract instance.
			 * @param object
			 */
			function fromJSON(object) {
				var contact;
				if (object.typeName = "PersonImpl") {
					contact = Person.fromJSON(object);
				} else if (object.typeName = "OrganizationImpl") {
					contact = Organization.fromJSON(object);
				} else {
					$log.error("No implementation for typeName " + object.typeName + " returning undefined");
					//Let it crash.
					return undefined;
				}
				contact.id = object.id;
				contact.dateCreated = dateUtilService.stringToDate(object.dateCreated);
				contact.lastUpdate = dateUtilService.stringToDate(object.lastUpdate);
				return contact;
			}

			/**
			 * Convert a PartyAbstract instance to a JSON object.
			 * @param object
			 */
			function toJSON(object) {
				var id = object.id;
				var typeName = object.typeName;
				var contact = object.toJSON();
				contact.id = id;
				contact.typeName = typeName;
				contact.dateCreated = object.dateCreated;
				contact.lastUpdate = object.lastUpdate;
				return contact;
			}

			var service = {

				/**
				 * Find one contact by id.
				 * @param id
				 */
				findOne: function (id) {
					$log.debug("Call to findOnd with " + id);
					return $http.jsonrpc(
						'/rpc/2.0/partyService',
						'findOne',
						[id]
					).then(function (resp) {
						var contact = resp.data.result;
						contact = fromJSON(contact);
						return contact;
					});
				},

				/**
				 * Find all by ids.
				 * @param ids
				 */
				findByIds: function (ids) {
					return $http.jsonrpc(
						'/rpc/2.0/partyService',
						'findByIds',
						[ids]
					).then(function (resp) {
						var contacts = resp.data.result;
						contacts = _.map(contacts, function (o) {
							return fromJSON(o);
						});
						return contacts;
					});
				},

				/**
				 * Find many by name.
				 * @param name
				 */
				findByName: function (name) {
					return $http.jsonrpc(
						'/rpc/2.0/partyService',
						'findByName',
						[name]
					).then(function (resp) {
						var contacts = resp.data.result;
						contacts = _.map(contacts, function (o) {
							return fromJSON(o);
						});
						return contacts;
					});
				},

				/**
				 * Find many by email.
				 * @param email
				 */
				findByEmail: function (email) {
					return $http.jsonrpc(
						'/rpc/2.0/partyService',
						'findByEmail',
						[email]
					).then(function (resp) {
						var contacts = resp.data.result;
						contacts = _.map(contacts, function (o) {
							return fromJSON(o);
						});
						return contacts;
					});
				},

				/**
				 * Find all people.
				 */
				findPeople: function () {
					return $http.jsonrpc(
						'/rpc/2.0/partyService',
						'findPeople',
						[]
					).then(function (resp) {
						var contacts = resp.data.result;
						contacts = _.map(contacts, function (o) {
							return fromJSON(o);
						});
						return contacts;
					});
				},

				/**
				 * Find all organizations.
				 */
				findOrganizations: function () {
					return $http.jsonrpc(
						'/rpc/2.0/partyService',
						'findOrganizations',
						[]
					).then(function (resp) {
						var contacts = resp.data.result;
						contacts = _.map(contacts, function (o) {
							return fromJSON(o);
						});
						return contacts;
					});
				},

				/**
				 * Insert a party.
				 * @param party
				 */
				insert: function (party) {
					$log.debug("Call to insert with " + JSON.stringify(party));
					var objectToSend = toJSON(party);

					return $http.jsonrpc(
						'/rpc/2.0/partyService',
						'insert',
						[objectToSend]
					).then(function (resp) {
						var contact = resp.data.result;
						contact = fromJSON(contact);
						return contact;
					});
				},

				/**
				 * Update a party.
				 * @param party
				 */
				update: function (party) {
					var objectToSend = toJSON(party);
					return $http.jsonrpc(
						'/rpc/2.0/partyService',
						'update',
						[objectToSend]
					).then(function (resp) {
						var contact = resp.data.result;
						contact = fromJSON(contact);
						return contact;
					});
				}
			};
			return service;
		}];