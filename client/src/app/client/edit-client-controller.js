'use strict';

var _ = require('lodash');
// var angular = require('angular');

module.exports = [
'$scope','partyService','$state','client','clientGroup','$modal','$filter','$mdDialog','$mdToast','$stateParams', function(
 $scope , partyService , $state , client , clientGroup , $modal , $filter , $mdDialog , $mdToast , $stateParams) {

	var contacts = [];
	if(!_.isNil(clientGroup)){
		contacts = _.map(clientGroup.values, function (o) {
			return o.party;
		});
	}

	// Set current group code of client organization
	var clientGroupCode = (_.isNil(clientGroup))?null:clientGroup.code;

	console.log('client being edited:', client, ', group code',clientGroupCode, ', contacts', contacts);
	$scope.currentNavItem = $stateParams.tab;

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
	
	$scope.save = function () {
		partyService.update($scope.client).then(function () {
			console.log('Client has been saved!');
			window.history.back();
		});
	};
		
	$scope.cancel = function () {
		window.history.back();
	};

	$scope.saveContact = function() {
		// Validate first and last name
		if($scope.contact.name.first === '' || _.isNil($scope.contact.name.first)) {
			infoDialog('party.dialogs.contactNameEmpty');
			return;
		}else if($scope.contact.name.last === '' || _.isNil($scope.contact.name.last)) {
			infoDialog('party.dialogs.contactLastNameEmpty');
			return;
		}

		// Save client contact
		partyService.update($scope.contact).then(function (result) {
			console.log('client contact saved', result);
			$mdToast.show(
				$mdToast.simple()
					.textContent($filter('translate')('party.dialogs.contactSaved'))
					.position( 'top right' )
					.hideDelay(3000)
			);
			$state.go('client.edit', {id: client.id, tab:'contacts'}, {reload: true});
		});
	};

	$scope.editClientContact = function(contactId) {
		// hide toolbar inside contact template
		$scope.hideContactToolbar = true;

		partyService.findOne(contactId).then(function(response){
			$scope.currentNavItem='contacts';
			$scope.editContact=true;
			$scope.contact = response;
			console.log('$scope.contact', $scope.contact);
		});

		// $mdDialog.show({
		// 	controller: ['$scope', function($scope ) {
		//
		// 		$scope.contact = {};
		// 		partyService.findOne(contactId).then(function(response){
		// 			$scope.contact = response;
		// 			console.log('$scope.contact', $scope.contact);
		// 		});
		// 		$scope.type = 'client contact';
		//
		// 		$scope.save = function() {
		// 			// Validate first and last name
		// 			if($scope.contact.name.first === '' || _.isNil($scope.contact.name.first)) {
		// 				infoDialog('party.dialogs.contactNameEmpty');
		// 				return;
		// 			}else if($scope.contact.name.last === '' || _.isNil($scope.contact.name.last)) {
		// 				infoDialog('party.dialogs.contactLastNameEmpty');
		// 				return;
		// 			}
		//
		// 			// Save client contact
		// 			partyService.update($scope.contact).then(function (result) {
		// 				console.log('client contact saved', result);
		// 				$mdToast.show(
		// 					$mdToast.simple()
		// 						.textContent($filter('translate')('party.dialogs.contactSaved'))
		// 						.position( 'top right' )
		// 						.hideDelay(3000)
		// 				);
		// 				$mdDialog.cancel();
		// 				$state.go('client.edit', {id: client.id, tab:'contacts'}, {reload: true});
		// 			});
		// 		};
		//
		// 		$scope.cancel = function() {
		// 			$mdDialog.cancel();
		// 		};
		// 	}],
		// 	templateUrl: 'common/components/templates/contact.html',
		// 	parent: angular.element(document.body),
		// 	clickOutsideToClose: true
		// });
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