'use strict';


module.exports = [
	'$scope', '$state', 'clientsList', 'partyService', function ($scope, $state, clientsList, partyService) {

		$scope.editClient = function (id) {
			$state.go('client.edit', {id: id, tab:'client'});
		};

		$scope.init = function () {
			partyService.findOrganizationByIsSupplier(false)
				.then(function (result) {
					$scope.clientsList = result;
					console.log('Client:',result);
				});
		};

		$scope.init();


	}];