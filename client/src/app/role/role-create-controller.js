'use strict';

var _ = require('lodash');
var Role = require('janux-authorize').Role;
var AuthorizationContext = require('janux-authorize').AuthorizationContext;
var util = require('../../common/security/util');

module.exports = [
	'$scope', 'authContextGroups', 'roleService', '$state',
	function ($scope, authContextGroups, roleService, $state) {

		$scope.authContextGroups = authContextGroups;

		$scope.cancel = function () {
			window.history.back();
		};

		$scope.role = {
			'name'        : '',
			'description' : '',
			'isAlmighty'  : false,
			'enabled'     : true,
			'authContexts': {}
		};

		$scope.createRole = function () {

			// Instantiate the authorization contexts from which
			// at least one permit has been granted for this role

			// Extract authorization contexts
			var authContexts = _.mapKeys(_.flatten(_.map(authContextGroups, 'values')), 'name');
			// console.log('authContexts', authContexts);

			// Create Role
			var role = Role.createInstance($scope.role.name, $scope.role.description);
			role.enabled = $scope.role.enabled;
			role.isAlmighty = $scope.role.isAlmighty;

			for (var contextName in $scope.role.authContexts) {

				// Create instance of authorization context
				var givenContext = AuthorizationContext.fromJSON(authContexts[contextName]);

				// Get granted bits list
				var grantedBits = [];
				for (var grantedBit in _.values($scope.role.authContexts[contextName])[0]) {
					grantedBits.push(grantedBit);
				}

				role.grant(grantedBits, givenContext);
			}

			roleService.insert(role.toJSON()).then(function () {
				$state.go('permissions.roles');
			});
		};

		// Convert object of authorization bits to array
		$scope.authCBitsToArray = util.authCBitsToArray;
	}];