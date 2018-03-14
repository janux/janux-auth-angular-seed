'use strict';
var PhoneNumber = require('janux-people').PhoneNumber;
var Email = require('janux-people').EmailAddress;
var PostalAddress = require('janux-people').PostalAddress;


module.exports = [
'$scope','partyService','$state','client','contacts', function(
 $scope , partyService , $state , client , contacts) {

	console.log('client being edited', client, 'contacts', contacts);
	$scope.currentNavItem = 'client';

	$scope.client = client;
	$scope.contacts = contacts;

	$scope.addNewAddress = function() {
	    $scope.client.setContactMethod('work', new PostalAddress());
	};

	$scope.removeAddress = function(z) {
	    $scope.client.contactMethods.addresses.splice(z,1);
	};

	$scope.addNewPhone = function() {
		$scope.client.setContactMethod('work', new PhoneNumber());
	};

	$scope.removePhone = function(z) {
	    $scope.client.contactMethods.phones.splice(z,1);
	};

	$scope.addNewMail = function() {
	    $scope.client.setContactMethod('work', new Email());
	};

	$scope.removeMail = function(z) {
	    $scope.client.contactMethods.emails.splice(z,1);
	};
	
	$scope.save = function () {
		partyService.update($scope.client).then(function () {
			console.log('Client has been saved!');
			window.history.back();
		});
	};
		
	$scope.cancel = function () {
		window.history.back();
	};
}];