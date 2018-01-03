'use strict';


module.exports = [
	'$scope', 'staff', 'partyService', function ($scope, staff, partyService) {

		$scope.init = function () {
			partyService.findPeople()
				.then(function (result) {
					$scope.staffList = result;
					console.log('Staff:',result);
				});
		};

		$scope.init();
	}];