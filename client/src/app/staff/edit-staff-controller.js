'use strict';

module.exports = [
'$scope','partyService','$state','staff', function(
 $scope , partyService , $state , staff) {

	console.log('staff being edited', staff);

	$scope.staff = staff;
	$scope.currentNavItem = 'general';

	$scope.save = function () {
		partyService.update($scope.staff).then(function () {
			console.log('Staff has been saved!');
			window.history.back();
		});
	};
		
	$scope.cancel = function () {
		window.history.back();
	};
}];