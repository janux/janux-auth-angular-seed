'use strict';

var moment = require('moment');
var _ = require('lodash');

module.exports =
['$scope','clientsList','$state','operationService','$mdToast','$filter', function(
  $scope , clientsList , $state , operationService , $mdToast , $filter){

	$scope.cl = clientsList;

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

		// console.log('Operation to save', operation);

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

