'use strict';


module.exports = [
	'$scope', '$state', 'clientsList', 'partyService', function ($scope, $state, clientsList, partyService) {

		$scope.editClient = function (id) {
			$state.go('client.edit', {id: id});
		};

		$scope.init = function () {
			partyService.findOrganizations()
				.then(function (result) {
					$scope.clientsList = result;
					console.log('Client:',result);
				});
		};

		$scope.init();


	}];