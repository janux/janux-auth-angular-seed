'use strict';

var _ = require('lodash');

module.exports =
['$q', '$http',
function( $q ,  $http){

	var service = {

		// Load available permission bits
		loadPermissionBits: function()
		{
			return $http.jsonrpc(
				'/rpc/2.0/auth',
				'loadPermissionBits'
			).then(function(resp) {
				var out = resp.data.result;
				return out;
			});
		},

		// Load available authorization contexts
		loadAuthorizationContexts: function()
		{
			return $http.jsonrpc(
				'/rpc/2.0/auth',
				'loadAuthorizationContexts'
			).then(function(resp) {
				return resp.data.result;
			});
		},

		// Load available authorization contexts within their respective groups
		loadAuthorizationContextGroups: function()
		{
			return $http.jsonrpc(
				'/rpc/2.0/auth',
				'loadAuthorizationContextGroups'
			).then(function(resp) {
				return resp.data.result;
			});
		},

		// Load authorization contexts groups list
		loadAuthorizationContextGroupsList: function()
		{
			return $http.jsonrpc(
				'/rpc/2.0/auth',
				'loadAuthorizationContextGroupsList'
			).then(function(resp) {
				return resp.data.result;
			});
		},

		loadAuthorizationContextByName: function(contextName)
		{
			return $http.jsonrpc(
				'/rpc/2.0/auth',
				'loadAuthorizationContextByName',
				[ contextName ]
			).then(function(resp) {
				console.log('resp.data.result', resp.data.result);
				return resp.data.result;
			});
		},

		insertAuthorizationContext: function(contextGroupCode, contextObject)
		{
			return $http.jsonrpc(
				'/rpc/2.0/auth',
				'insertAuthorizationContext',
				[ contextGroupCode, contextObject ]
			).then(function(resp) {
				console.log('resp.data.result', resp.data.result);
				return resp.data.result;
			});
		},

		updateAuthorizationContext: function(name, contextGroupCode, modifiedContext)
		{
			return $http.jsonrpc(
				'/rpc/2.0/auth',
				'updateAuthorizationContext',
				[ name, contextGroupCode, modifiedContext ]
			).then(function(resp) {
				console.log('resp.data.result', resp.data.result);
				return resp.data.result;
			});
		},

		deleteAuthorizationContextByName: function(groupCode, contextName)
		{
			return $http.jsonrpc(
				'/rpc/2.0/auth',
				'deleteAuthorizationContextByName',
				[ groupCode, contextName ]
			).then(function(resp) {
				console.log('resp.data.result', resp.data.result);
				return resp.data.result;
			});
		},

		loadAuthorizationContextGroup: function(contextGroupCode)
		{
			return $http.jsonrpc(
				'/rpc/2.0/auth',
				'loadAuthorizationContextGroup',
				[ contextGroupCode ]
			).then(function(resp) {
				console.log('resp.data.result', resp.data.result);
				return resp.data.result;
			});
		},

		insertAuthorizationContextGroup: function(contextGroupObject)
		{
			return $http.jsonrpc(
				'/rpc/2.0/auth',
				'insertAuthorizationContextGroup',
				[ contextGroupObject ]
			).then(function(resp) {
				console.log('resp.data.result', resp.data.result);
				return resp.data.result;
			});
		},

		updateAuthorizationContextGroup: function(code, contextGroupObject)
		{
			return $http.jsonrpc(
				'/rpc/2.0/auth',
				'updateAuthorizationContextGroup',
				[ code, contextGroupObject ]
			).then(function(resp) {
				console.log('resp.data.result', resp.data.result);
				return resp.data.result;
			});
		},

		loadRoles: function () {
			return $http.jsonrpc(
				'/rpc/2.0/auth',
				'loadRoles'
			).then(function(resp) {
				return resp.data.result;
			});
		},

		loadRoleByName: function (roleName) {
			return $http.jsonrpc(
				'/rpc/2.0/auth',
				'loadRoleByName',
				[ roleName ]
			).then(function(resp) {
				var role = resp.data.result;
				// Index by name
				role.authContexts = _.mapKeys(role.authContexts, function (authC) {
					return authC.name;
				});
				return role;
			});
		}
	};
	return service;
}];