'use strict';

const _ = require('lodash');

module.exports = [
	'$scope', '$state', 'partyGroupService', 'userService', 'security', function ($scope, $state, partyGroupService, userService, security) {

		$scope.editStaff = function (id) {
			$state.go('staffClient.edit', {id: id});
		};

		$scope.init = function () {

			return userService.findCompanyInfo(security.currentUser.username)
				.then(function (result) {
					return partyGroupService.findOneOwnedByPartyAndType(result.id, 'COMPANY_CONTACTS', true);
				})
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