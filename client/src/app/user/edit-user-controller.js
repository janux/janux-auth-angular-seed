'use strict';

var _ = require('lodash');

module.exports = [
'$scope','userService','$state','user','roles','$modal','dialogService','validationService',function(
 $scope , userService , $state , user , roles , $modal , dialogService , validationService) {

	console.log('user being edited', user);

	$scope.user = user;
	$scope.roles = roles;

	$scope.currentNavItem = 'user';
	
	$scope.save = function () {

		if (!_.isNil($scope.user.contact.emailAddresses(false)) &&
			$scope.user.contact.emailAddresses(false).length > 0) {
			if(!_.every($scope.user.contact.emailAddresses(false), function (email) {
				if (!validationService.email(email.address)) {
					dialogService.info('party.dialogs.invalidEmail');
					return false;
				}
				return true;
			})) {
				return false;
			}
		}

		$scope.user.roles = [];

		// Enabled roles
		$scope.roles.forEach(function (role) {
			if(role.enabled) {
				$scope.user.roles.push(role.name);
			}
		});

		userService.saveOrUpdate($scope.user).then(function () {
			console.log('User has been saved!');
			window.history.back();
		});
	};
		
	$scope.cancel = function () {
		window.history.back();
	};

	$scope.openDeleteAuthContextDialog = function(){
		$modal.open({
			templateUrl: 'app/dialog-tpl/delete-dialog.html',
			controller: ['$scope','$modalInstance', 'data',
			function($scope , $modalInstance, data) {
				$scope.targetDescr = 'User: '+data.username;

				$scope.ok = function() {
					userService.deleteUser(data.id).then(function() {
						$modalInstance.close();
						window.history.back();
					});
				};

				$scope.cancel = function() {
					$modalInstance.dismiss();
				};
			}],
			size: 'md',
			resolve: {
				data: function () {
					return user;
				}
			}
		});
	};
}];