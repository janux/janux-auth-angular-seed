'use strict';

module.exports = [
'$scope', 'authContexts', function($scope, authContexts) {

	$scope.authContexts = authContexts;

	$scope.cancel = function () {
		window.history.back();
	};

	console.log('Authoization Contexts', authContexts);

	$scope.createRole = function () {
		// TODO: Implement functionality to create a role
	};
}];