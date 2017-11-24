'use strict';

var mockData=require('../../app/staff/mock-data.js');

module.exports =
['$q', '$http',
function( $q ,  $http){

	var service = {
		//Find all staff members
		findAll: function () {
			return $q.when(mockData.staff);

			// var deferred = $q.defer();
			// deferred.resolve(mockData.staff);
			// return deferred.promise;
		}
	
	};
	return service;
}];