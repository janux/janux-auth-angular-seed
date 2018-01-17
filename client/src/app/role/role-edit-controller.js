'use strict';

var _ = require('lodash');
var Role = require('janux-authorize').Role;
var AuthorizationContext = require('janux-authorize').AuthorizationContext;
var util = require('../../common/security/util');

module.exports = [
	'$scope','role', 'authContextGroups','$state','roleService',
	function($scope , role, authContextGroups, $state, roleService) {

		var roleName = role.name;	// save the role name in case it changes

		$scope.cancel = function () {
			window.history.back();
		};

		$scope.authContextGroups = authContextGroups;
		console.debug('Authorization Contexts Groups', authContextGroups);

		// Extract authorization contexts
		var authContexts = _.mapKeys(_.flatten(_.map(authContextGroups, 'values')),'name');

		var loadedRole = Role.fromJSON(role);
		loadedRole.authContexts = {};

		var setBit = function (contextName, bit) {
			if(typeof loadedRole.authContexts[contextName] === 'undefined') {
				loadedRole.authContexts[contextName] = { bit: {} };
			}
			loadedRole.authContexts[contextName].bit[bit] = true;
		};

		for(var contextName in authContexts) {
			// console.log('Granted bits', $scope.role.getGrantAsBitList(contextName));
			loadedRole.getGrantAsBitList(contextName).forEach(setBit.bind(null,contextName));
		}

		$scope.role = loadedRole;
		console.log('scope.role', $scope.role);

		$scope.saveRole = function () {
			var roleToSave = Role.createInstance($scope.role.name, $scope.role.description);
			roleToSave.enabled = $scope.role.enabled;
			roleToSave.isAlmighty = $scope.role.isAlmighty;

			for(var contextName in $scope.role.authContexts) {

				// Create instance of authorization context
				var givenContext = AuthorizationContext.fromJSON(authContexts[contextName]);

				// Get granted bits list
				var grantedBits = [];
				for (var grantedBit in _.values($scope.role.authContexts[contextName])[0]) {
					if (_.values($scope.role.authContexts[contextName])[0][grantedBit]) {
						grantedBits.push(grantedBit);
					}
				}

				roleToSave.grant(grantedBits, givenContext);
			}

			roleService.update(roleName, roleToSave.toJSON()).then(function(){
				$state.go('permissions.roles');
			});
		};

		// Convert object of authorization bits to array
		$scope.authCBitsToArray = util.authCBitsToArray;
	}];