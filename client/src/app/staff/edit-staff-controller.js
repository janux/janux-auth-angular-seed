'use strict';

var _ = require('lodash');

module.exports = [
'$scope','partyService','$state','staff','dialogService','validationService',function(
 $scope , partyService , $state , staff , dialogService , validationService) {

	console.log('staff being edited', staff);

	$scope.staff = staff;

	$scope.save = function () {
		if (!_.isNil($scope.staff.emailAddresses(false)) &&
			$scope.staff.emailAddresses(false).length > 0) {
			if(!_.every($scope.staff.emailAddresses(false), function (email) {
					if (!validationService.email(email.address)) {
						dialogService.info('party.dialogs.invalidEmail');
						return false;
					}
					return true;
				})) {
				return false;
			}
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
