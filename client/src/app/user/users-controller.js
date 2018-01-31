'use strict';

var moment = require('moment');
var _ = require('lodash');

module.exports = [
'$scope','userService', 'partyService','$state','users','$modal','$q','$filter', function(
 $scope , userService , partyService, $state , users , $modal , $q , $filter) {

	$scope.usersMatch = users;
	$scope.searchField = 'username';
	$scope.searchString = '';

	$scope.searchFields = ['username', 'name', 'email', 'phone'];

	var infoDialog = function(translateKey){
		$modal.open({
			templateUrl: 'app/dialog-tpl/info-dialog.html',
			controller: ['$scope','$modalInstance',
				function($scope , $modalInstance) {
					$scope.message= $filter('translate')(translateKey);

					$scope.ok = function() {
						$modalInstance.close();
					};
				}],
			size: 'md'
		});
	};

	$scope.findUsers = function() {
		userService.findBy($scope.searchField, $scope.searchString).then(function(usersMatch) {
			$scope.usersMatch = _.map(usersMatch,function(user){
				user.cdate = moment(user.cdate).format('YYYY-MM-DD HH:mm:ss');
				return user;
			});
			console.log('$scope.usersMatch', $scope.usersMatch);
		});

		partyService.findPeople()
			.then(function (result) {
				console.log(JSON.stringify(result));
			});
	};

	$scope.editUser = function(userId) {
		$state.go('users.edit', { userId: userId });
	};

	$scope.openDelete = function(){
		var selectedIds = [];
		for (var i = 0; i<$scope.usersMatch.length; i++) {
			if($scope.usersMatch[i].Selected){
				var userId = $scope.usersMatch[i].userId;
				selectedIds.push(userId);
			}
		}

		if(selectedIds.length>0) {
			$modal.open({
				templateUrl: 'app/dialog-tpl/confirm-dialog.html',
				controller: ['$scope','$modalInstance','$filter',
					function($scope , $modalInstance, $filter) {
						$scope.message= $filter('translate')('user.dialogs.confirmDeletion');

						$scope.ok = function() {
							var userDeletionArray =[];
							//TO DO Create Method inside server
							for (var i = 0; i<selectedIds.length; i++) {
								console.log(selectedIds[i]);
								userDeletionArray.push(userService.deleteUser(selectedIds[i]));
							}
							$q.all(userDeletionArray).then(function(){
								$state.go($state.current, {}, {reload: true});
							});

							$modalInstance.close();
						};

						$scope.cancel = function() {
							$modalInstance.close();
						};
					}],
				size: 'md'
			});
		}else{
			infoDialog('user.dialogs.noRowSelectedError');
		}
	};

}];