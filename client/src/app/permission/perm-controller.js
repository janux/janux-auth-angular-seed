'use strict';

module.exports = [
'$scope','authContextGroups', function(
 $scope , authContextGroups) {

		$scope.authContextGroups = authContextGroups;
		console.log('authContextGroups', authContextGroups);
}];