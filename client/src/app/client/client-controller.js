'use strict';


module.exports = [
	'$scope', 'clientsList', 'partyService', function ($scope, clientsList, partyService) {


		$scope.init = function () {
			partyService.findOrganizations()
				.then(function (result) {
					$scope.clientsList = result;
					console.log('Client:',result);
				});
		};

		$scope.init();


	}];