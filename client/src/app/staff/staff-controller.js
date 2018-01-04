'use strict';


module.exports = [
	'$scope', '$state', 'staff', 'partyService', function ($scope, $state, staff, partyService) {

		$scope.editStaff = function(id) {
			$state.go('staff.edit', { id: id });
		};
		
		$scope.init = function () {
			partyService.findPeople()
				.then(function (result) {
					$scope.staffList = result;
					console.log('Staff:',result);
				});
		};

		$scope.init();
	}];