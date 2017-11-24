'use strict';


module.exports = [
'$scope','staff', function(
 $scope , staff) {

	$scope.staffList=staff;
	console.log('Staff:',staff);
	
}];