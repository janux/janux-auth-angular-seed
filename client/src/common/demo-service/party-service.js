/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 11/23/17.
 */
'use strict';

var Person = require('janux-people').Person;
var Organization = require('janux-people').Organization;
var _ = require('lodash');


module.exports =
	['$q', '$http', 'dateUtilService', '$log', 'dialogService', '$filter',
function ($q, $http, dateUtilService, $log, dialogService, $filter) {

	var DUPLICATED_EMAIL = 'There is another record with the same email address';

	/**
	 * Convert a json object to a PartyAbstract instance.
	 * @param object
	 */
	function fromJSON(object) {
		var contact;
		if (_.isNil(object)) return object;

		var result = _.cloneDeep(object);

		if (result.typeName === "PersonImpl") {
			contact = Person.fromJSON(result);
		} else if (result.typeName === "OrganizationImpl") {
			contact = Organization.fromJSON(result);
		} else {
			$log.error("No implementation for typeName " + result.typeName + " returning undefined");
			//Let it crash.
			return undefined;
		}
		contact.id = result.id;
		contact.dateCreated = dateUtilService.stringToDate(result.dateCreated);
		contact.lastUpdate = dateUtilService.stringToDate(result.lastUpdate);
		contact.isSupplier = result.isSupplier;
		contact.isReseller = result.isReseller;
		contact.functionsProvided = _.isArray(result.functionsProvided) ? result.functionsProvided : [];
		contact.functionsReceived = _.isArray(result.functionsReceived) ?  result.functionsReceived : [];
		contact.staff = result.staff;
		contact.taxIdentificationCode = result.taxIdentificationCode;
		return contact;
	}

	/**
	 * Convert a PartyAbstract instance to a JSON object.
	 * @param object
	 */
	function toJSON(object) {

		var cloned = _.cloneDeep(object);
		var id = cloned.id;
		var typeName = cloned.typeName;
		var contact = cloned.toJSON();
		contact.id = id;
		contact.typeName = typeName;
		contact.dateCreated = object.dateCreated;
		contact.lastUpdate = object.lastUpdate;
		contact.isSupplier = object.isSupplier;
		contact.isReseller = object.isReseller;
		contact.functionsProvided = object.functionsProvided;
		contact.functionsReceived = object.functionsReceived;
		contact.staff = object.staff;
		contact.taxIdentificationCode = object.taxIdentificationCode;
		return contact;
	}


	function handleError(errors) {
		// For the moment handle the first error.
		const error = _.isArray(errors.data.error) ? errors.data.error[0] : errors.data.error;
		const value = error.value;
		const serverMessage = error.message;
		var message;
		if (serverMessage === DUPLICATED_EMAIL) {
			message = $filter('translate')('party.dialogs.duplicatedEmail') + ". " +
				$filter('translate')('party.dialogs.contactDuplicated') + (value.displayName ? value.displayName : value.name) + ".";
		} else {
			message = serverMessage;
		}
		dialogService.info(message, false);
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
				// console.log('partyService findOne', contact);
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
		 * Find organizations by isSupplierFlag.
		 * @param isSupplier
		 */
		findOrganizationByIsSupplier: function (isSupplier) {
			return $http.jsonrpc(
				'/rpc/2.0/partyService',
				'findOrganizationByIsSupplier',
				[isSupplier]
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
		 * @param timeEntry
		 */
		insert: function (timeEntry) {
			$log.debug("Call to insert with " + JSON.stringify(timeEntry));
			var objectToSend = toJSON(timeEntry);

			return $http.jsonrpc(
				'/rpc/2.0/partyService',
				'insert',
				[objectToSend]
			).then(function (resp) {
				var contact = resp.data.result;
				contact = fromJSON(contact);
				return contact;
			}).catch(function (err) {
				handleError(err);
				return Promise.reject(err.data.error.message);
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
			}).catch(function (err) {
				handleError(err);
				return Promise.reject(err.data.error.message);
			});
		},

		/**
		 * This method is intended to clean unnecessary data in the party object
		 * @param party
		 */
		clean: function (party) {
			// By the moment we are only removing empty emails
			var emails = party.emailAddresses(false);
			if (!_.isNil(emails) && emails.length > 0) {
				emails.forEach(function (email, iEmail) {
					if (_.isNil(email.address) || email.address === '') {
						emails.splice(iEmail, 1);
					}
				});
			}
			party.contactMethods['emails'] = emails;
			return party;
		},

		/**
		 * Get the first email address ,
		 * if the party has no email address, return and empty string.
		 * @param party
		 */
		getDefaultEmailAddress: function (party) {
			var email;
			if (_.isArray(party.contactMethods.emails) && party.contactMethods.emails.length > 0) {
				email = party.contactMethods.emails[0].address;
			} else {
				email = '';
			}
			return email;
		},

		fromJSON: function (object) {
			return fromJSON(object);
		},

		toJSON: function (object) {
			return toJSON(object)
		},

		handleError: function (errors) {
			handleError(errors);
		}
	};
	return service;
}];
