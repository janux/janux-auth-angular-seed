'use strict';
var Organization = require('janux-people').Organization;
var PhoneNumber = require('janux-people').PhoneNumber;
var Email = require('janux-people').EmailAddress;
var PostalAddress = require('janux-people').PostalAddress;

module.exports = [
'$scope','partyService', function(
 $scope , partyService ) {

 		// Create a new client
		var client = new Organization();
		client.setContactMethod('work', new PhoneNumber());
		client.setContactMethod('work', new Email());
		client.setContactMethod('work', new PostalAddress());

		$scope.client = client;	
		console.log('Staff: ',$scope.client);
  
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
			console.log('client created', $scope.client);
			//Setting the supplier flag as false.
			$scope.client.isSupplier = false;
			partyService.insert($scope.client).then(function (resp) {
				console.log('Client has been saved!', resp);
				window.history.back();
			});
		};

		$scope.cancel = function () {
			window.history.back();
		};

	}];