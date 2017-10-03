'use strict';

module.exports = [
'$scope','group','authContextService','$state', function(
 $scope , group , authContextService , $state) {

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

			authContextService.updateGroup(code, group)
				.then(function () {
					$state.go('permissions.auth-contexts');
				});
		}else {
			console.error('Please complete all required fields');
		}
	};

}];