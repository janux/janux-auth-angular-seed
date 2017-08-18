'use strict';

module.exports = [
'$scope','role', 'authContexts', function($scope , role, authContexts) {
	$scope.role = role;
	$scope.authContexts = authContexts;

	console.log('Authoization Contexts', authContexts);
	console.log('Loaded role', role);
}];