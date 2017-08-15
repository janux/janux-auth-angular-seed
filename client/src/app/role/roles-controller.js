'use strict';

module.exports = [
'$scope','roles', function($scope , roles) {
	$scope.roles = roles;
	// console.log('Loaded roles', roles);
}];