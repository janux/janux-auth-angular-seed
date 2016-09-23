'use strict';

module.exports = [
'$scope','userService','$state', function(
 $scope , userService , $state) {

	$scope.usersMatch = [];
	$scope.searchField = 'username';
	$scope.searchString = '';

	$scope.searchFields = ['username', 'name', 'email', 'phone'];

	$scope.findUsers = function() {
		userService.findBy($scope.searchField, $scope.searchString).then(function(usersMatch) {
			$scope.usersMatch = usersMatch;
		});
	};
		
	$scope.editUser = function(userId) {
		$state.go('users.edit', { userId: userId });
	};

	$scope.deleteUser = function (userId) {
		userService.deleteUser(userId).then(function(userDeleted) {
			console.log('User successfully deleted', userDeleted);
			window.history.back();
		});
	};
}];