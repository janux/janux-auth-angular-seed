'use strict';

module.exports = [
'$scope','role', 'authContexts', function($scope , role, authContexts) {

	for (var iContext in role.authContexts) {
		for (var iBit in role.authContexts[iContext].bit) {
			role.authContexts[iContext].bit[iBit] = true;
		}
	}

	$scope.cancel = function () {
		window.history.back();
	};

	$scope.role = role;
	$scope.authContexts = authContexts;

	console.log('Authoization Contexts', authContexts);
	console.log('Loaded role', role);

	$scope.saveRole = function () {
		// TODO: Implement functionality to save a role
	};
}];