'use strict';

module.exports = [
'$scope','userService', function(
 $scope , userService ) {

	$scope.usersMatch = [];
	$scope.searchField = 'username';
	$scope.searchString = '';

	$scope.searchFields = ['username', 'name', 'email', 'phone'];

	$scope.findUsers = function() {
		userService.findBy($scope.searchField, $scope.searchString).then(function(usersMatch) {
			$scope.usersMatch = usersMatch;
		});
	};

	$scope.deleteUser = function (userId) {
		console.log('Delete the user', userId);
	};
}];