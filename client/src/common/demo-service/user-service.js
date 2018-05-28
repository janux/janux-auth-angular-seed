'use strict';

var Person = require('janux-people').Person;

module.exports =
['$q', '$http',
function( $q ,  $http ){

	// TODO. Improve a better way to cache this information.
	var cachedCompanyInfo;

	var service = {


		// Find users by specifying the field and search string
		findBy: function(field, search)
		{
			return $http.jsonrpc(
				'/rpc/2.0/users',
				'findBy',
				[ field, search ]
			).then(function(resp) {
				var out = resp.data.result;
				out = (typeof out.length === 'undefined')?[out]:out;
				console.log('findBy', field, search, out);
				out.forEach(function(user, iUser){
					out[iUser].contact = Person.fromJSON(out[iUser].contact);
				});
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
				out.contact = Person.fromJSON(out.contact);
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
					out[iUser].contact = Person.fromJSON(out[iUser].contact);
				});
				return out;
			});
		},

		findCompanyInfo: function(username){
			if (_.isNil(cachedCompanyInfo)) {
				return $http.jsonrpc(
					'/rpc/2.0/users',
					'findCompanyInfo',
					[ username ]
				).then(function(resp) {
					// TODO. For some reason, I can't import PartyService, maybe due to some circular dependency.
					// return PartyService.fromJSON(resp.data.result);
					if (!_.isNil(resp.data.result)) {
						cachedCompanyInfo = resp.data.result;
					}else{
						cachedCompanyInfo = undefined;
					}
					return resp.data.result;
				});
			}else{
				return $q.resolve(cachedCompanyInfo);
			}
		},

		// Add new user
		saveOrUpdate: function(userObject)
		{
			var userObjClone = _.cloneDeep(userObject);
			var id = userObjClone.contact.id;
			var typeName = userObjClone.contact.typeName;
			userObjClone.contact = userObjClone.contact.toJSON();
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
