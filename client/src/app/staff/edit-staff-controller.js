'use strict';

module.exports = [
'$scope','partyService','$state','staff','dialogService', function(
 $scope , partyService , $state , staff , dialogService) {

	console.log('staff being edited', staff);

	$scope.staff = staff;

	$scope.save = function () {
		partyService.update($scope.staff).then(function () {
			console.log('Staff has been saved!');
			window.history.back();
		}).catch(function (err) {
			dialogService.info(err, true);
		});
	};

	$scope.cancel = function () {
		window.history.back();
	};
}];
