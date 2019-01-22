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
		type: 'CONSULTING',
		name: '',
		start: '',
		end: '',
		description: '',
		client: {object:null, search:''},
		interestedParty: {object:null, search:''},
		principals: [{object:null, search:''}],
		staff: [{object:null, search:''}],
		vehicles: [{object:null, search:''}],
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
		} else if (!_.isDate(operation.begin)) {
			infoDialog('services.specialForm.dialogs.startEmpty');
			return;
		}
		// else if (!_.isDate(operation.end)) {
		// 	infoDialog('services.specialForm.dialogs.endEmpty');
		// 	return;
		// }
		// else if (operation.begin > operation.end) {
		// 	infoDialog('operations.dialogs.endDateError');
		// 	return;
		// }
		else if(_.isDate(operation.end)){
			if (operation.begin > operation.end) {
				infoDialog('operations.dialogs.endDateError');
				return;
			}
		}
		else if (_.isNil(operation.client.object)) {
			infoDialog('services.specialForm.dialogs.clientEmpty');
			return;
		}
		// else if (operation.interestedParty.object === '') {
		// 	infoDialog('services.specialForm.dialogs.requesterEmpty');
		// 	return;
		// } else if (operation.principals[0].object === '') {
		// 	infoDialog('services.specialForm.dialogs.principalEmpty');
		// 	return;
		// } else if (operation.staff[0].object === '') {
		// 	infoDialog('services.specialForm.dialogs.staffEmpty');
		// 	return;
		// } else if (operation.vehicles[0].object === '') {
		// 	infoDialog('services.specialForm.dialogs.vehicleEmpty');
		// 	return;
		// }

		operation.client = operation.client.object;
		operation.interestedParty = operation.interestedParty.object;
		operation.principals = _.chain(operation.principals)
			.map('object')
			.filter(function (principal) { return (!_.isNil(principal)); })
			.value();

		var resources = [];

		var staff = _.chain(operation.staff)
			.filter(function (staff) { return (!_.isNil(staff.object)); })
			.map(function (staff) {
				delete staff.object.id;
				return staff.object;
			})
			.value();

		resources = resources.concat(staff);

		var vehicles = _.chain(operation.vehicles)
			.filter(function (vehicle) { return (!_.isNil(vehicle.object)); })
			.map(function (vehicle) {
				delete vehicle.object.id;
				return vehicle.object;
			})
			.value();

		resources = resources.concat(vehicles);

		operation.resources = resources;
		operation.begin = moment(operation.begin).toDate();
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
			$state.go('services.consulting');
		});
	};

	// Return to operations list
	$scope.cancel = function () {
		$state.go('services.consulting');
	};
}];

