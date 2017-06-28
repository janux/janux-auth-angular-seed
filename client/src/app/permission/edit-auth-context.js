'use strict';

var _ = require('lodash');
// var AuthorizationContext = require('janux-security').AuthorizationContext;

module.exports = [
	'$scope','authContext',
function($scope, authContext){

	console.log('authContext', authContext);

	$scope.permissionBits = _.keys(authContext.bit);
	$scope.contextName = authContext.name;
	$scope.contextDesc = '';
	$scope.contextGroup = '';

	$scope.cancel = function () {
		window.history.back();
	};

	$scope.createAuthContext = function () {

		if(!$scope.authContextForm.$invalid){
			if($scope.permissionBits.length > 0){
				// var authContext = AuthorizationContext.createInstance($scope.contextName, $scope.contextDesc, selBits);

				// TODO: Implement functionality to save an authorization context by name or id
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