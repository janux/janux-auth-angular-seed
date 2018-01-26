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
				'/rpc/2.0/authContext',
				'loadPermissionBits'
			).then(function(resp) {
				var out = resp.data.result;
				return out;
			});
		},

		// Load available authContextorization contexts
		findAll: function()
		{
			return $http.jsonrpc(
				'/rpc/2.0/authContext',
				'findAll'
			).then(function(resp) {
				return resp.data.result;
			});
		},

		// Load available authContextorization contexts within their respective groups
		findGroups: function()
		{
			return $http.jsonrpc(
				'/rpc/2.0/authContext',
				'findGroups'
			).then(function(resp) {
				return resp.data.result;
			});
		},

		// Load authContextorization contexts groups list
		findGroupsList: function()
		{
			return $http.jsonrpc(
				'/rpc/2.0/authContext',
				'findGroupsList'
			).then(function(resp) {
				return resp.data.result;
			});
		},

		findOneByName: function(contextName)
		{
			return $http.jsonrpc(
				'/rpc/2.0/authContext',
				'findOneByName',
				[ contextName ]
			).then(function(resp) {
				console.log('resp.data.result', resp.data.result);
				return resp.data.result;
			});
		},

		insert: function(contextGroupCode, contextObject)
		{
			return $http.jsonrpc(
				'/rpc/2.0/authContext',
				'insert',
				[ contextGroupCode, contextObject ]
			).then(function(resp) {
				console.log('resp.data.result', resp.data.result);
				return resp.data.result;
			});
		},

		update: function(name, contextGroupCode, modifiedContext)
		{
			return $http.jsonrpc(
				'/rpc/2.0/authContext',
				'update',
				[ name, contextGroupCode, modifiedContext ]
			).then(function(resp) {
				console.log('resp.data.result', resp.data.result);
				return resp.data.result;
			});
		},

		updateSortOrder: function(authsOrder)
		{
			return $http.jsonrpc(
				'/rpc/2.0/authContext',
				'updateSortOrder',
				[ authsOrder ]
			).then(function(resp) {
				console.log('resp.data.result', resp.data.result);
				return resp.data.result;
			});
		},

		deleteByName: function(groupCode, contextName)
		{
			return $http.jsonrpc(
				'/rpc/2.0/authContext',
				'deleteByName',
				[ groupCode, contextName ]
			).then(function(resp) {
				console.log('resp.data.result', resp.data.result);
				return resp.data.result;
			});
		},

		findGroupByCode: function(contextGroupCode)
		{
			return $http.jsonrpc(
				'/rpc/2.0/authContext',
				'findGroupByCode',
				[ contextGroupCode ]
			).then(function(resp) {
				console.log('resp.data.result', resp.data.result);
				return resp.data.result;
			});
		},

		insertGroup: function(contextGroupObject)
		{
			return $http.jsonrpc(
				'/rpc/2.0/authContext',
				'insertGroup',
				[ contextGroupObject ]
			).then(function(resp) {
				console.log('resp.data.result', resp.data.result);
				return resp.data.result;
			});
		},

		updateGroup: function(code, contextGroupObject)
		{
			return $http.jsonrpc(
				'/rpc/2.0/authContext',
				'updateGroup',
				[ code, contextGroupObject ]
			).then(function(resp) {
				console.log('resp.data.result', resp.data.result);
				return resp.data.result;
			});
		},

		updateGroupsSortOrder: function(groupsOrder)
		{
			return $http.jsonrpc(
				'/rpc/2.0/authContext',
				'updateGroupsSortOrder',
				[ groupsOrder ]
			).then(function(resp) {
				console.log('resp.data.result', resp.data.result);
				return resp.data.result;
			});
		},

		removeGroup: function(code)
		{
			return $http.jsonrpc(
				'/rpc/2.0/authContext',
				'removeGroup',
				[ code ]
			).then(function(resp) {
				console.log('resp.data.result', resp.data.result);
				return resp.data.result;
			});
		}
	};
	return service;
}];