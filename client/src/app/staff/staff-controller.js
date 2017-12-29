'use strict';


module.exports = [
	'$scope', 'staff', 'partyService', function ($scope, staff, partyService) {

		$scope.staffList = staff;
		console.log('Staff:', staff);

		$scope.init = function () {
			partyService.findPeople()
				.then(function (result) {
					$scope.staffList = result;
				});
		};

		$scope.init();
	}];