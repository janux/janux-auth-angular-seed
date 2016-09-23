'use strict';

var Person = require('janux-people').Person;

module.exports =
['$q', '$http',
function( $q ,  $http){

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
				out.contact = Person.fromJSON(out.contact);
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

		// Add new user
		saveOrUpdate: function(userObject)
		{
			userObject.contact = userObject.contact.toJSON();
			
			return $http.jsonrpc(
				'/rpc/2.0/users',
				'saveOrUpdate',
				[ userObject ]
			).then(function(resp) {
				var out = resp.data.result;
				console.log('saveOrUpdate', out);
				return out;
			});
		}
	};
	return service;
}];