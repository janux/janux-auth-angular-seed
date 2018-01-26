'use strict';

module.exports = [
'$scope','authContextService','$state', function(
 $scope , authContextService , $state) {

	$scope.contextGroupName = '';
	$scope.contextGroupCode = '';
	$scope.contextGroupDesc = '';

	$scope.cancel = function () {
		window.history.back();
	};

	$scope.saveAuthContextGroup = function () {
		if(!$scope.authContextGroupForm.$invalid){

			var group = {
				name: $scope.contextGroupName,
				code: $scope.contextGroupCode,
				description: $scope.contextGroupDesc,
				attributes: { sortOrder: '0' }
			};

			authContextService.insertGroup(group)
				.then(function () {
					$state.go('permissions.auth-contexts');
				});
		}else {
			console.error('Please complete all required fields');
		}
	};

}];