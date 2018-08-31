/**
 * Project janux-auth-angular-seed
 * Created by ernesto on 10/31/17.
 */
'use strict';

var _ = require('lodash');

module.exports = ['$q', '$http', function ($q, $http) {

	var service = {

		getEnvironmentInfo:function () {
			return $http.jsonrpc(
				'/rpc/2.0/environment',
				'getEnvironmentInfo',
				[]
			).then(function (resp) {
				return resp.data.result;
			});
		}
	};
	return service;
}];
