'use strict';

var mockData=require('../../app/client/mock-data.js');

module.exports =
['$q', '$http',
function( $q ,  $http){

	var service = {
		//Find all client members
		findAll: function () {
			return $q.when(mockData.client);

			// var deferred = $q.defer();
			// deferred.resolve(mockData.client);
			// return deferred.promise;
		}
	
	};
	return service;
}];