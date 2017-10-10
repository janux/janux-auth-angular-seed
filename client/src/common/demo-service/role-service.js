'use strict';

var _ = require('lodash');

module.exports =
['$q', '$http',
function( $q ,  $http){

	var service = {

		findAll: function () {
			return $http.jsonrpc(
				'/rpc/2.0/role',
				'findAll'
			).then(function(resp) {
				return resp.data.result;
			});
		},

		findOneByName: function (roleName) {
			return $http.jsonrpc(
				'/rpc/2.0/role',
				'findOneByName',
				[ roleName ]
			).then(function(resp) {
				var role = resp.data.result;
				// Index by name
				role.roleContexts = _.mapKeys(role.roleContexts, function (roleC) {
					return roleC.name;
				});
				return role;
			});
		},

		insert: function(roleObject)
		{
			return $http.jsonrpc(
				'/rpc/2.0/role',
				'insert',
				[ roleObject ]
			).then(function(resp) {
				console.log('resp.data.result', resp.data.result);
				return resp.data.result;
			});
		},

		update: function(name, modifiedRole)
		{
			return $http.jsonrpc(
				'/rpc/2.0/role',
				'update',
				[ name, modifiedRole ]
			).then(function(resp) {
				console.log('resp.data.result', resp.data.result);
				return resp.data.result;
			});
		},

		deleteByName: function(roleName)
		{
			return $http.jsonrpc(
				'/rpc/2.0/role',
				'deleteByName',
				[ roleName ]
			).then(function(resp) {
				console.log('resp.data.result', resp.data.result);
				return resp.data.result;
			});
		}
	};
	return service;
}];