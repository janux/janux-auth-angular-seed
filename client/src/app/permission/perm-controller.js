'use strict';

module.exports = [
'$scope','authContexts', function(
 $scope , authContexts) {

		$scope.authContexts =  authContexts;
		console.log('permissionBits', authContexts);
}];