'use strict';
var PhoneNumber = require('janux-people').PhoneNumber;
var Email = require('janux-people').EmailAddress;
var PostalAddress = require('janux-people').PostalAddress;


module.exports = [
'$scope','partyService','$state','staff', function(
 $scope , partyService , $state , staff) {

	console.log('staff being edited', staff);

	$scope.staff = staff;

	$scope.addNewAddress = function() {
	    $scope.staff.setContactMethod('work', new PostalAddress());
	};

	$scope.removeAddress = function(z) {
	    $scope.staff.contactMethods.addresses.splice(z,1);
	};

	$scope.addNewPhone = function() {
		$scope.staff.setContactMethod('work', new PhoneNumber());
	};

	$scope.removePhone = function(z) {
	    $scope.staff.contactMethods.phones.splice(z,1);
	};

	$scope.addNewMail = function() {
	    $scope.staff.setContactMethod('work', new Email());
	};

	$scope.removeMail = function(z) {
	    $scope.staff.contactMethods.emails.splice(z,1);
	};
	
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