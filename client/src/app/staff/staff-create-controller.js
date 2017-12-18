'use strict';


module.exports = [
	'$scope', function ($scope) {

		$scope.addresses = [{type: '', country: '', fiscal:'',street1:'',street2:'',city:'',state:'',zip:''}];
  
		$scope.addNewAddress = function() {
		    var newItemNo = $scope.addresses.length+1;
		    $scope.addresses.push({'id':'address'+newItemNo});
		    $scope.itemAddress=newItemNo;
		};

		$scope.removeAddress = function(z) {
		    //var lastItem = $scope.addresses.length-1;
		    $scope.addresses.splice(z,1);
		    //$scope.lastAddress=lastItem;
		};

		$scope.phones = [{type: '', code: '', area:'',ext:'',sms:'',wps:''}];
  
		$scope.addNewPhone = function() {
		    var newItemNo = $scope.phones.length+1;
		    $scope.phones.push({'id':'phone'+newItemNo});
		    $scope.itemPhone=newItemNo;
		};

		$scope.removePhone = function(z) {
		    //var lastItem = $scope.phones.length-1;
		    $scope.phones.splice(z,1);
		    //$scope.lastPhone=lastItem;
		};

		$scope.mails = [{type: '', mail: ''}];
  
		$scope.addNewMail = function() {
		    var newItemNo = $scope.mails.length+1;
		    $scope.mails.push({'id':'mail'+newItemNo});
		    $scope.itemMail=newItemNo;
		};

		$scope.removeMail = function(z) {
		    //var lastItem = $scope.mails.length-1;
		    $scope.mails.splice(z,1);
		    //$scope.lastMail=lastItem;
		};

	}];