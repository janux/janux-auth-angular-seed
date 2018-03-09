'use strict';

var moment = require('moment');
var _ = require('lodash');

module.exports =
['$scope','clientsList','$state','operationService', 'operation','$modal','$filter', function(
	$scope , clientsList , $state , operationService, operation, $modal, $filter ){

	console.log('Operation', operation);

	$scope.cl = clientsList;
	$scope.editMode = false;

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

	var mapOperationToEditable = function (operation) {
		operation.client = {object:operation.client, search: ''};
		operation.interestedParty = {object:operation.interestedParty, search:''};
		operation.principals = (operation.principals.length>0)?_.map(operation.principals, function(principal){
			return {object:principal, search:''};
		}):[{object:'', search:''}];

		// Filter Vehicles
		operation.vehicles = _.filter( operation.currentResources, { type:'VEHICLE' } );
		operation.vehicles = (operation.vehicles.length>0)?_.map(operation.vehicles,function (vehicle) {
			return {object:vehicle, search:''};
		}):[{object:'', search:''}];

		// Filter staff
		operation.staff = _.filter( operation.currentResources, function (resource){
			return (resource.type !== 'VEHICLE');
		} );
		operation.staff = (operation.staff.length>0)?_.map(operation.staff,function (staff) {
			return {object:staff, search:''};
		}):[{object:'', search:''}];

		return operation;
	};

	$scope.data = mapOperationToEditable(operation);
	console.log('$scope.data', $scope.data);

	// Update operation
	$scope.save = function () {
		// Process operation to insert
		var operation = _.clone($scope.data);

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
		} else if (operation.principals.length===0 || operation.principals[0].object === '') {
			infoDialog('services.specialForm.dialogs.principalEmpty');
			return;
		} else if (operation.staff.length===0 || operation.staff[0].object === '') {
			infoDialog('services.specialForm.dialogs.staffEmpty');
			return;
		} else if (operation.vehicles.length===0 || operation.vehicles[0].object === '') {
			infoDialog('services.specialForm.dialogs.vehicleEmpty');
			return;
		}

		operation.client = operation.client.object;
		operation.interestedParty = operation.interestedParty.object;
		operation.principals = _.filter(operation.principals, function (principal) {
			return (!_.isNil(principal.object));
		});
		operation.principals = _.map(operation.principals,'object');

		var resources = [];
		operation.staff = _.filter(operation.staff,function (staff) {
			return (!_.isNil(staff.object));
		});
		resources = resources.concat(_.map(operation.staff,function (staff) {
			delete staff.object.id;
			return staff.object;
		}));
		operation.vehicles = _.filter(operation.vehicles,function (vehicle) {
			return (!_.isNil(vehicle.object));
		});
		resources = resources.concat(_.map(operation.vehicles,function (vehicle) {
			delete vehicle.object.id;
			return vehicle.object;
		}));

		operation.currentResources = resources;
		operation.start = moment(operation.start).toDate();
		operation.end = (!_.isNil(operation.end))?moment(operation.end).toDate():null;

		delete operation.staff;
		delete operation.vehicles;

		console.log('Operation to update', operation);

		console.log('Operation to save', operation);

		operationService.update(operation).then(function (result) {
			console.log('Updated operation', result);
			$state.go('services.list');
		});
	};

	// Return to operations list
	$scope.cancel = function () {
		$state.go('services.list');
	};
}];