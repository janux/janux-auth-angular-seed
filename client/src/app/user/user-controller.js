'use strict';

var Person = require('janux-people').Person;

module.exports = [
'$scope','userService', function(
 $scope , userService ) {

	$scope.usersMatch = [];
	$scope.usernameFilter = '';

	$scope.findUsers = function(){
		userService.findByUsernameMatch($scope.usernameFilter).then(function(usersMatch) {
			console.log('usersMatch', usersMatch);
			if(typeof usersMatch.length === 'undefined'){
				usersMatch = [usersMatch];
			}
			$scope.usersMatch = usersMatch;
			$scope.usersMatch.forEach(function(user, iUser){
				$scope.usersMatch[iUser].contact = Person.fromJSON(JSON.parse($scope.usersMatch[iUser].contact));
			});
			// console.log('userService - findByUsernameMatch', usersMatch);
		});
	};
}];