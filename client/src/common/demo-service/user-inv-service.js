'use strict';

var Person = require('janux-people').Person;

module.exports =
['$q', '$http','partyService','dateUtilService',
function ( $q ,  $http, partyService, dateUtilService) {

	function fromJSON(object) {
		if (_.isNil(object)) {
			return object;
		}
		var result = _.clone(object);
		result.mdate = dateUtilService.stringToDate(object.mdate);
		result.cdate = dateUtilService.stringToDate(object.cdate);
		result.expire = dateUtilService.stringToDate(object.expire);
		result.contact = partyService.fromJSON(object.contact);
		return result;
	}

	function toJSON(object) {
		if (_.isNil(object)) {
			return object;
		}
		var result = _.clone(object);
		result.contact = partyService.toJSON(object.contact);
		return result;
	}

	var service = {

		// Load invitation by code
		findByCode: function(code)
		{
			return $http.jsonrpc(
				'/rpc/public/invitation',
				'findOneByCode',
				[ code ]
			).then(function(resp) {
				var out = resp.data.result;
				var id = out.account.contact.id;
				out.account.contact = partyService.fromJSON(out.account.contact);
				out.account.contact.id = id;
				return out;
			});
		},

		// Load invitation by account id
		findByAccountId: function(accountId)
		{
			return $http.jsonrpc(
				'/rpc/2.0/userInvitation',
				'findOneByAccountId',
				[ accountId ]
			).then(function(resp) {
				var out = resp.data.result;
				return out;
			});
		},

		findByAccountIdsIn: function(accountIds)
		{
			return $http.jsonrpc(
				'/rpc/2.0/userInvitation',
				'findByAccountIdsIn',
				[ accountIds ]
			).then(function(resp) {
				var out = resp.data.result;
				return out;
			});
		},

		update: function(invitation)
		{
			var userInvObjClone = _.cloneDeep(invitation);
			var id = userInvObjClone.account.contact.id;
			var typeName = userInvObjClone.account.contact.typeName;
			userInvObjClone.account.contact = partyService.toJSON(userInvObjClone.account.contact);
			userInvObjClone.account.contact.id = id;
			userInvObjClone.account.contact.typeName= typeName;

			return $http.jsonrpc(
				'/rpc/public/invitation',
				'update',
				[ userInvObjClone ]
			).then(function(resp) {
				var out = resp.data.result;
				console.log('updated invitation', out);
				return out;
			});
		},

		/**
		 *
		 * @param contactId
		 * @param selectedEmail
		 * @param assignedRoles
		 */
		inviteToCreateAccount: function (contactId, selectedEmail, assignedRoles) {
			return $http.jsonrpc(
				'/rpc/2.0/userInvitation',
				'inviteToCreateAccount',
				[contactId, selectedEmail, assignedRoles]
			).then(function (resp) {
				return resp.data.result;
			});
		},

		/**
		 *
		 * @param accountId
		 * @param selectedEmail
		 */
		recoverPassword: function (accountId, contactId, selectedEmail) {
			return $http.jsonrpc(
				'/rpc/public/invitation',
				'recoverPassword',
				[ accountId, contactId, selectedEmail ]
			).then(function (resp) {
				var out = resp.data.result;
				return out;
			});
		}
	};
	return service;
}];
