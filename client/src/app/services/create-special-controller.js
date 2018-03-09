'use strict';

var moment = require('moment');
var _ = require('lodash');

module.exports =
['$scope','clientsList','$state','operationService','$mdToast','$filter','$modal', function(
  $scope , clientsList , $state , operationService , $mdToast , $filter , $modal){

	$scope.cl = clientsList;

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

	$scope.data = {
		type: 'SPECIAL_OPS',
		name: '',
		start: '',
		end: '',
		description: '',
		client: {object:'', search:''},
		interestedParty: {object:'', search:''},
		principals: [{object:'', search:''}],
		staff: [{object:'', search:''}],
		vehicles: [{object:'', search:''}],
		status: 'active',
		billable: true
	};

	// Insert operation
	$scope.save = function () {

		// Process operation to insert
		var operation = _.clone($scope.data);
		console.log('Operation to insert', operation);

		// Validate operation
		if(operation.name === '') {
			infoDialog('services.specialForm.dialogs.nameEmpty');
			return;
		} else if (!_.isDate(operation.start)) {
			infoDialog('services.specialForm.dialogs.startEmpty');
			return;
		} else if (operation.client.object === '') {
			infoDialog('services.specialForm.dialogs.clientEmpty');
			return;
		} else if (operation.interestedParty.object === '') {
			infoDialog('services.specialForm.dialogs.requesterEmpty');
			return;
		} else if (operation.principals[0].object === '') {
			infoDialog('services.specialForm.dialogs.principalEmpty');
			return;
		} else if (operation.staff[0].object === '') {
			infoDialog('services.specialForm.dialogs.staffEmpty');
			return;
		} else if (operation.vehicles[0].object === '') {
			infoDialog('services.specialForm.dialogs.vehicleEmpty');
			return;
		}

		operation.client = operation.client.object;
		operation.interestedParty = operation.interestedParty.object;
		operation.principals = _.map(operation.principals,'object');

		var resources = [];
		resources = resources.concat(_.map(operation.staff,function (staff) {
			delete staff.object.id;
			return staff.object;
		}));
		resources = resources.concat(_.map(operation.vehicles,function (vehicle) {
			delete vehicle.object.id;
			return vehicle.object;
		}));

		operation.currentResources = resources;
		operation.start = moment(operation.start).toDate();
		operation.end = (!_.isNil(operation.end))?moment(operation.end).toDate():null;

		delete operation.staff;
		delete operation.vehicles;

		console.log('Operation to save', operation);

		operationService.insert(operation).then(function (result) {
			console.log('Inserted operation', result);
			$mdToast.show(
				$mdToast.simple()
					.textContent($filter('translate')('operations.dialogs.addedSpecialOp'))
					.position( 'top right' )
					.hideDelay(3000)
			);
			$state.go('services.list');
		});
	};

	// Return to operations list
	$scope.cancel = function () {
		$state.go('services.list');
	};
}];

