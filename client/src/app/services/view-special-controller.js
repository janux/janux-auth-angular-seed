'use strict';

var moment = require('moment');
var _ = require('lodash');

module.exports =
['$scope','clientsList','$state','operationService', 'operation', function(
	$scope , clientsList , $state , operationService, operation ){

	console.log('Operation', operation);

	$scope.cl = clientsList;
	$scope.editMode = false;

	var mapOperationToEditable = function (operation) {
		operation.client = {object:operation.client, search: ''};
		operation.interestedParty = {object:operation.interestedParty, search:''};
		operation.principals = _.map(operation.principals, function(principal){
			return {object:principal, search:''};
		});

		// Filter Vehicles
		operation.vehicles = _.map(_.filter( operation.currentResources, { type:'VEHICLE' } ),function (vehicle) {
			return {object:vehicle, search:''};
		});
		// Filter staff
		operation.staff = _.map(_.filter( operation.currentResources, function (resource){
			return (resource.type !== 'VEHICLE');
		} ),function (staff) {
			return {object:staff, search:''};
		});

		return operation;
	};

	$scope.data = mapOperationToEditable(operation);
	console.log('$scope.data', $scope.data);

	// Update operation
	$scope.save = function () {
		// Process operation to insert
		var operation = _.clone($scope.data);

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