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
				var out = _.values(resp.data.result);
				return out;
			});
		}
	};
	return service;
}];