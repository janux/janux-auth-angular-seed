'use strict';

var _ = require('lodash');
var AuthorizationContext = require('janux-authorize').AuthorizationContext;

module.exports = [
		'$scope','authContext','groupsList','authService','$state','$stateParams',
function($scope , authContext , groupsList , authService , $state , $stateParams){

	var name = authContext.name;
	$scope.permissionBits = _.keys(authContext.bit);
	$scope.contextName = name;
	$scope.contextDesc = authContext.description;
	$scope.contextGroupCode = $stateParams.contextGroupCode;
	$scope.groupsList = groupsList;

	$scope.cancel = function () {
		window.history.back();
	};

	$scope.saveAuthContext = function () {

		console.log('$scope.permissionBits', $scope.permissionBits);

		if(!$scope.authContextForm.$invalid){
			if($scope.permissionBits.length > 0){
				var authContext = AuthorizationContext.createInstance($scope.contextName, $scope.contextDesc, $scope.permissionBits);

				authService.updateAuthorizationContext(name, $scope.contextGroupCode, authContext.toJSON())
					.then(function () {
						$state.go('permissions.auth-contexts');
					});
			}else{
				console.error('Select at least one permission bit in order to create an authorization context');
			}
		}else {
			console.error('Please complete all required fields');
		}
	};

	$scope.addPermissionBit = function () {
		$scope.permissionBits.push('');
	};

	$scope.removeBit = function (index) {
		$scope.permissionBits.splice(index,1);
	};
}];