'use strict';

module.exports = [
'$scope','authContextGroups','authService','$state', function(
 $scope , authContextGroups , authService , $state) {

		$scope.authContextGroups = authContextGroups;
		// console.log('authContextGroups', authContextGroups);

		$scope.deleteAuthContext = function (groupCode, name) {
			return 	authService.deleteAuthorizationContextByName(groupCode, name)
				.then(function () {
					$state.go($state.current, {}, {reload: true});
				});
		};
}];