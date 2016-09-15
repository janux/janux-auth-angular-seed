'use strict';

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
		findByUsername: function(username)
		{
			return $http.jsonrpc(
				'/rpc/2.0/users',
				'findByUsername',
				[ username ]
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
				return resp.data.result;
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