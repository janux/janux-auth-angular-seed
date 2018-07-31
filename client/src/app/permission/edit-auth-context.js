'use strict';

var _ = require('lodash');
var AuthorizationContext = require('janux-authorize').AuthorizationContext;
var util = require('../../common/security/util');

module.exports = [
	'$scope', 'authContext', 'groupsList', 'authContextService', '$state', '$stateParams', '$modal',
	function ($scope, authContext, groupsList, authContextService, $state, $stateParams, $modal) {

		var name = authContext.name;

		// Convert object of authorization bits to array
		$scope.permissionBits = util.authCBitsToArray(authContext.bit);

		$scope.contextName = name;
		$scope.contextDesc = authContext.description;
		$scope.groupsList = groupsList;

		// Copying authorization context
		if ($stateParams.copyFromContext) {
			$scope.copying = true;
			$scope.contextName = '';
			$scope.contextDesc = '';
			$scope.copyFrom = $stateParams.copyFromContext;
			$scope.contextGroupCode = groupsList[0].code;
		}
		// Editing authorization context
		else if ($stateParams.contextGroupCode && $stateParams.contextName) {
			$scope.editing = true;
			$scope.contextGroupCode = $stateParams.contextGroupCode;
		}

		$scope.cancel = function () {
			window.history.back();
		};

		$scope.saveAuthContext = function () {

			var bitListSortedByPosition = $scope.permissionBits.sort(function (a, b) {
				return a.position > b.position;
			}).map(function (bit) {
				return bit.label;
			});

			if (!$scope.authContextForm.$invalid) {
				if ($scope.permissionBits.length > 0) {
					var authContext = AuthorizationContext.createInstance($scope.contextName, $scope.contextDesc, bitListSortedByPosition);

					if ($scope.copying) {
						if (authContext.name !== name) {
							authContextService.insert($scope.contextGroupCode, authContext.toJSON())
								.then(function () {
									$state.go('permissions.authcontexts');
								});
						} else {
							$modal.open({
								templateUrl: 'app/dialog-tpl/info-dialog.html',
								controller : ['$scope', '$modalInstance',
									function ($scope, $modalInstance) {
										$scope.message = 'The authorization context has the same name as the one you are copying';
										$scope.ok = function () {
											$modalInstance.close();
										};
									}],
								size       : 'md'
							});
						}
					} else if ($scope.editing) {
						authContextService.update(name, $scope.contextGroupCode, authContext.toJSON())
							.then(function () {
								$state.go('permissions.authcontexts');
							});
					}
				} else {
					console.error('Select at least one permission bit in order to create an authorization context');
				}
			} else {
				console.error('Please complete all required fields');
			}
		};

		$scope.addPermissionBit = function () {

			var maxPosition = ($scope.permissionBits.length > 0) ? _.maxBy($scope.permissionBits, function (bit) {
				return bit.position;
			}).position + 1 : 0;
			$scope.permissionBits.push({
				'label': '', 'position': maxPosition
			});
		};

		$scope.removeBit = function (position) {
			$scope.permissionBits = _.remove($scope.permissionBits, function (bit) {
				return bit.position !== position;
			});
		};
	}];