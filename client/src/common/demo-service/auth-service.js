'use strict';

module.exports =
['$q', '$http',
function( $q ,  $http){

	var service = {

		// Find users by specifying the field and search string
		loadPermissionBits: function()
		{
			return $http.jsonrpc(
				'/rpc/2.0/auth',
				'loadPermissionBits'
			).then(function(resp) {
				var out = resp.data.result;
				return out;
			});
		}
	};
	return service;
}];