'use strict';

module.exports = [
	'$scope', 'authContexts', function($scope, authContexts) {

		$scope.authContexts = authContexts;

		console.log('Authoization Contexts', authContexts);

		$scope.createRole = function () {
			// TODO: Implement functionality to create a role
		};
	}];