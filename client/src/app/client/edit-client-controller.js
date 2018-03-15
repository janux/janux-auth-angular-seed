'use strict';

var _ = require('lodash');

var PhoneNumber = require('janux-people').PhoneNumber;
var Email = require('janux-people').EmailAddress;
var PostalAddress = require('janux-people').PostalAddress;

module.exports = [
'$scope','partyService','$state','client','contacts','$modal','$filter', function(
 $scope , partyService , $state , client , contacts , $modal , $filter ) {

	console.log('client being edited', client, 'contacts', contacts);
	$scope.currentNavItem = 'client';

	$scope.client = client;
	$scope.contacts = contacts;

	var infoDialog = function (translateKey) {
		$modal.open({
			templateUrl: 'app/dialog-tpl/info-dialog.html',
			controller : ['$scope', '$modalInstance',
				function ($scope, $modalInstance) {
					$scope.message = $filter('translate')(translateKey);

					$scope.ok = function () {
						$modalInstance.close();
					};
				}],
			size       : 'md'
		});
	};

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

	// Disable selected client's contacts
	$scope.disableSelectedContacts= function () {

		var selectedContacts = _.chain($scope.contacts)
			.filter({selected:true})
			.map('id')
			.value();

		if (selectedContacts.length > 0) {
			$modal.open({
				templateUrl: 'app/dialog-tpl/confirm-dialog.html',
				controller : ['$scope', '$modalInstance',
					function ($scope, $modalInstance) {
						$scope.message = $filter('translate')('client.dialogs.confirmDeletion');

						$scope.ok = function () {
							infoDialog('To be implemented!');

							// Disable contacts
							// var promises = _.map(selectedContacts, function(contactId){
							//
							// 	// TODO: Implement method to disable contacts
							// 	return partyService.remove(contactId);
							// });

							// $q.all(promises).then(function(){
							// 	$mdToast.show(
							// 		$mdToast.simple()
							// 			.textContent($filter('translate')('client.dialogs.successDeletedContacts'))
							// 			.position( 'top right' )
							// 			.hideDelay(3000)
							// 	);
							// });

							$modalInstance.close();
						};

						$scope.cancel = function () {
							$modalInstance.close();
						};
					}],
				size       : 'md'
			});
		} else {
			infoDialog('client.dialogs.noRowSelectedError');
		}
	};
}];