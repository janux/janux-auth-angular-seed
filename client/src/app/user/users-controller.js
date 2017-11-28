'use strict';

var moment = require('moment');
var _ = require('lodash');

module.exports = [
'$scope','userService','$state','users','$modal', function(
 $scope , userService , $state , users , $modal) {

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

	var deleteUser = function (userId) {
		userService.deleteUser(userId).then(function(userDeleted) {
			console.log('User successfully deleted', userDeleted);
			$state.go($state.current, {}, {reload: true});
		});
	};

	var deleteUserCtrl = ['$scope','$modalInstance', 'data',
		function($scope , $modalInstance, data) {
			$scope.targetDescr = 'User: '+data.username;

			$scope.ok = function() {
				deleteUser(data.userId);
				$modalInstance.close();
			};

			$scope.cancel = function() {
				$modalInstance.dismiss();
			};
		}];

	$scope.openDeleteAuthContextDialog = function(user){
		$modal.open({
			templateUrl: 'app/dialog-tpl/delete-dialog.html',
			controller: deleteUserCtrl,
			size: 'md',
			resolve: {
				data: function () {
					return user;
				}
			}
		});
	};
}];