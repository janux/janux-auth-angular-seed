'use strict';

var _ = require('lodash');


module.exports = [
	'$scope', '$state', 'staff', 'partyService', 'partyGroupService', function ($scope, $state, staff, partyService, partyGroupService) {

		$scope.editStaff = function (id) {
			$state.go('staff.edit', {id: id});
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
				});
		};

		$scope.init();
	}];