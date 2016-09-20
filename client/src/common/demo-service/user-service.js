'use strict';

var Person = require('janux-people').Person;

module.exports =
['$q', '$http',
function( $q ,  $http){

	var service = {

		// Load user by id
		findById: function(userId)
		{
			return $http.jsonrpc(
				'/rpc/2.0/users',
				'findById',
				[ userId ]
			).then(function(resp) {
				return resp.data.result;
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
					out[iUser].contact = Person.fromJSON(JSON.parse(out[iUser].contact));
				});
				return out;
			});
		},

		// Add new user
		saveOrUpdate: function(userId, data)
		{
			return $http.jsonrpc(
				'/rpc/2.0/users',
				'saveOrUpdate',
				[ userId, data ]
			).then(function(resp) {
				return resp.data.result;
			});
		}
	};
	return service;
}];