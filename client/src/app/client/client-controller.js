'use strict';


module.exports = [
	'$scope', 'clientsList', function ($scope, clientsList) {

		$scope.clientsList = clientsList;
		console.log('Client:', clientsList);

	}];