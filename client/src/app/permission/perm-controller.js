'use strict';

module.exports = [
'$scope','permissionBits','authContexts', function(
 $scope , permissionBits , authContexts) {

		$scope.authContexts =  authContexts;
		$scope.permissionBits = permissionBits;

}];