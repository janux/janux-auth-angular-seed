'use strict';

module.exports = [
'$scope','userService', function(
 $scope , userService ) {

	$scope.usersMatch = [];
	$scope.usernameFilter = '';

	$scope.findUsers = function() {
		userService.findByUsernameMatch($scope.usernameFilter).then(function(usersMatch) {
			$scope.usersMatch = usersMatch;
		});
	};

	$scope.deleteUser = function (userId) {
		console.log('Delete the user', userId);
	}
}];