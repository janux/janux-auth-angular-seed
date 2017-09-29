'use strict';

module.exports = [
'$scope','group','authService','$state', function(
 $scope , group , authService , $state) {

	console.log('group', group);

	var code = group.code;
	$scope.contextGroupName = group.name;
	$scope.contextGroupCode = group.code;
	$scope.contextGroupDesc = group.description;

	$scope.cancel = function () {
		window.history.back();
	};

	$scope.saveAuthContextGroup = function () {
		if(!$scope.authContextGroupForm.$invalid){

			var group= {
				name : $scope.contextGroupName,
				code : $scope.contextGroupCode,
				description : $scope.contextGroupDesc
			};

			authService.updateAuthorizationContextGroup(code, group)
				.then(function () {
					$state.go('permissions.auth-contexts');
				});
		}else {
			console.error('Please complete all required fields');
		}
	};

}];