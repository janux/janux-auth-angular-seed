'use strict';

var _ = require('lodash');

/**
 * This snippet of angular decorates angular's native $http service with a
 * jsonrpc method that can be used to send jsonrpc requests in a manner
 * consisted with the normal $http interface
 */
require('angular').module('jsonrpc', ['LocalStorageModule']).config(['$provide',
	function ($provide) {
		// console.log('enhancing $http');
		return $provide.decorator('$http', ['$delegate', 'localStorageService', function ($delegate, localStorageService) {

			$delegate.jsonrpc = function (url, method, parameters, config) {
				var token = localStorageService.get("token");
				var headers;
				if (_.isUndefined(token) === true) {
					headers = {'Content-Type': "application/json"};
				} else {
					headers = {'Content-Type': "application/json", 'Authorization': 'Bearer ' + token};
				}
				var data = {'jsonrpc': '2.0', 'method': method, 'params': parameters, 'id': 1};
				// filter the user object from the logs, more cosmetic than security issue
				var filteredParms = _.filter(parameters, function (parm) {
					return !_.isString(parm.password)
				});
				console.debug('calling:' + url + ' - ' + method + ' - ' + JSON.stringify(filteredParms));
				return $delegate.post(url, data, angular.extend(
					{'headers': headers}, config));
			};

			return $delegate;
		}]);
	}
]);
