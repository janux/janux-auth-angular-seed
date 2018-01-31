'use strict';

var Email = require('janux-people').EmailAddress;

module.exports = [
'$scope','userService','$state','user','roles','$modal', function(
 $scope , userService , $state , user , roles , $modal) {

	console.log('user being edited', user);

	$scope.user = user;
	$scope.roles = roles;
	$scope.user.email = user.contact.emailAddress('work').address;

	$scope.currentNavItem = 'user';
	
	$scope.save = function () {

		// Update email
		$scope.user.contact.setContactMethod('work', new Email($scope.user.email));
		delete $scope.user.email;

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