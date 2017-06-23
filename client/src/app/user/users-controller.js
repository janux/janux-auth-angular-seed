'use strict';

var moment = require('moment');
var _ = require('lodash');

module.exports = [
'$scope','userService','$state','users', function(
 $scope , userService , $state , users) {

	$scope.usersMatch = users;
	$scope.searchField = 'username';
	$scope.searchString = '';

	$scope.searchFields = ['username', 'name', 'email', 'phone'];

	$scope.findUsers = function() {
		userService.findBy($scope.searchField, $scope.searchString).then(function(usersMatch) {
			$scope.usersMatch = _.map(usersMatch,function(user){
				user.cdate = moment(user.cdate).format('YYYY-MM-DD HH:mm:ss');
				return user;
			});
			console.log('$scope.usersMatch', $scope.usersMatch);
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