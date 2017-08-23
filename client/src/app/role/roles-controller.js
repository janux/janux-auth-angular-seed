'use strict';

module.exports = [
'$scope','roles', function($scope , roles) {
	$scope.roles = roles;
	// console.log('Loaded roles', roles);

	$scope.deleteRole = function () {
		// TODO: Implement functionality to delete a role
	};
}];