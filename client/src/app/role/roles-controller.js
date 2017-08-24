'use strict';

var _ = require('lodash');

module.exports = [
'$scope','roles', function($scope , roles) {
	$scope.roles = _.values(roles);
	// console.log('Loaded roles', $scope.roles);

	$scope.deleteRole = function () {
		// TODO: Implement functionality to delete a role
	};
}];