'use strict';

module.exports = [
'$scope','partyService','$state','staff','validationService','dialogService', function(
 $scope , partyService , $state , staff , validationService , dialogService) {

	console.log('staff being edited', staff);

	$scope.staff = staff;

	$scope.save = function () {
		$scope.staff = partyService.clean($scope.staff);
		if (!validationService.everyEmailAddress($scope.staff.emailAddresses(false))) {
			dialogService.info('party.dialogs.invalidEmail');
			return false;
		}

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
