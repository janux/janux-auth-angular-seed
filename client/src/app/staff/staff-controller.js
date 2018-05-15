'use strict';

var _ = require('lodash');


module.exports = [
	'$scope', '$state', 'staff', 'partyService', 'partyGroupService', 'resourceService', function ($scope, $state, staff, partyService, partyGroupService, resourceService) {

		$scope.editStaff = function (id) {
			$state.go('staff.edit', {id: id});
		};

		$scope.findSupplier = function () {
			partyService.findOne('10000')
				.then(function (result) {
					$scope.supplier = result;
				});
		};
		$scope.init = function () {
			// partyService.findPeople()
			// 	.then(function (result) {
			// 		// $scope.staffList = result;
			// 		console.log('Staff:', result);
			// 	});

			partyGroupService.findOne('glarus_staff_group')
				.then(function (result) {
					// console.log('result ' + JSON.stringify(result));
					var parties = _.map(result.values, function (o) {
						return o.party;
					});
					$scope.staffList = parties;
					$scope.refreshResources();
					$scope.findSupplier();
				});
		};

		$scope.refreshResources = function () {
			resourceService.findAvailableResourcesByVendor('10000')
				.then(function (resources) {
					$scope.assignableResources = resources;
					$scope.staffList = _.map($scope.staffList, function (it) {
						var resource = _.find(resources, function (res) {
							return res.resource.id === it.id;
						});
						it.isAvailable = _.isNil(resource) === false;
						return it;
					});
				});
		};

		$scope.switchAvailability = function (available, idParty) {
			if (available === false) {
				// Remove the resource.
				var resourceToRemove = _.find($scope.assignableResources, function (o) {
					return o.resource.id === idParty;
				});

				if (_.isNil(resourceToRemove) === false) {
					// Remove the resource.
					resourceService.removeByIdsWithValidation([resourceToRemove.id])
						.then(function () {
							$scope.refreshResources();
						});
				}
			} else {
				// For the moment the type is driver. Later maybe allow the user to chose
				// The capabilities of the resource.
				var newResource = {
					type      : 'DRIVER',
					resource  : _.find($scope.staffList, function (o) {
						return o.id === idParty;
					}),
					vendor    : $scope.supplier,
					assignable: true
				};

				resourceService.insertMany([newResource])
					.then(function (result) {
						console.log('inserted resources: ' + JSON.stringify(result));
						$scope.refreshResources();
					});
			}
		};

		$scope.init();
	}];