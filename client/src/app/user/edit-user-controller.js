'use strict';

module.exports = [
'$scope','userService','$state','user', function(
 $scope , userService , $state , user) {

	console.log('user being edited', user);

	$scope.user = user;
	
	$scope.save = function () {
		userService.saveOrUpdate($scope.user).then(function () {
			console.log('User has been saved!');
			window.history.back();
		});
	};
		
	$scope.cancel = function () {
		window.history.back();
	};
}];