'use strict';

var Person = require('janux-people').Person;

module.exports =
['$q', '$http','partyService','dateUtilService',
function( $q ,  $http, partyService, dateUtilService){

	function fromJSON(object) {
		if (_.isNil(object)) {
			return object;
		}
		var result = _.clone(object);
		result.mdate = dateUtilService.stringToDate(object.mdate);
		result.cdate = dateUtilService.stringToDate(object.cdate);
		result.expire = dateUtilService.stringToDate(object.expire);
		result.expirePassword = dateUtilService.stringToDate(object.expirePassword);
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



		// Find users by specifying the field and search string
		findBy: function(field, search, username)
		{
			return $http.jsonrpc(
				'/rpc/2.0/users',
				'findBy',
				[ field, search, username ]
			).then(function(resp) {
				var out = resp.data.result;
				out = (typeof out.length === 'undefined')?[out]:out;
				console.log('findBy', field, search, out);
				// out.forEach(function(user, iUser){
				// 	out[iUser].contact = partyService.fromJSON(out[iUser].contact);
				// });

				return out;
			});
		},

		// Load user by id
		findById: function(userId)
		{
			return $http.jsonrpc(
				'/rpc/2.0/users',
				'findById',
				[ userId ]
			).then(function(resp) {
				var out = resp.data.result;
				var id = out.contact.id;
				out.contact = partyService.fromJSON(out.contact);
				out.contact.id= id;
				return out;
			});
		},

		// Load all users by user id
		findByUsernameMatch: function(username)
		{
			return $http.jsonrpc(
				'/rpc/2.0/users',
				'findByUsernameMatch',
				[ username ]
			).then(function(resp) {
				var out = resp.data.result;
				out.forEach(function(user, iUser){
					out[iUser].contact = partyService.fromJSON(out[iUser].contact);
				});
				return out;
			});
		},

		findOneByUsernameOrEmail: function(subject)
		{
			return $http.jsonrpc(
				'/rpc/public/invitation',
				'findOneByUsernameOrEmail',
				[ subject ]
			).then(function(resp) {
				console.log('user found', resp);
				var out = resp.data.result;
				var id = out.contact.id;
				out.contact = partyService.fromJSON(out.contact);
				out.contact.id = id;
				return out;
			}).catch(function (err) {
				console.error('findOneByUsernameOrEmail Error'+ err.data.error.message);
				return null;
			});
		},

		findCompanyInfo: function(username){
			return $http.jsonrpc(
				'/rpc/2.0/users',
				'findCompanyInfo',
				[ username ]
			).then(function(resp) {
				// TODO. For some reason, I can't import PartyService, maybe due to some circular dependency.
				// return PartyService.fromJSON(resp.data.result);

				return resp.data.result;
			});
		},

		// Add new user
		saveOrUpdate: function(userObject)
		{
			var userObjClone = _.cloneDeep(userObject);
			var id = userObjClone.contact.id;
			var typeName = userObjClone.contact.typeName;
			userObjClone.contact = partyService.toJSON(userObjClone.contact);
			userObjClone.contact.id = id;
			userObjClone.contact.typeName= typeName;

			// //
			// // If the user's role has been loaded, we ensure that only the name is stored back
			// //
			// userObjClone.roles = _.map(userObjClone.roles, function (role) {
			//	return (typeof role.name !== 'undefined')?role.name:role;
			// });

			return $http.jsonrpc(
				'/rpc/2.0/users',
				'saveOrUpdate',
				[ userObjClone ]
			).then(function(resp) {
				var out = resp.data.result;
				console.log('saveOrUpdate', out);
				return out;
			}).catch(function (err) {
				return Promise.reject(err.data.error[0].message);
			});
		},

		// Delete user by id
		deleteUser: function(userId)
		{
			return $http.jsonrpc(
				'/rpc/2.0/users',
				'deleteUser',
				[ userId ]
			).then(function(resp) {
				return resp.data.result;
			});
		}
	};
	return service;
}];
