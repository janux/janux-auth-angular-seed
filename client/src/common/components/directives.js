"use strict";

var PhoneNumber = require('janux-people').PhoneNumber;
var Email = require('janux-people').EmailAddress;
var PostalAddress = require('janux-people').PostalAddress;

var scopeDefinition = { "data":"=", "section":"@" };

angular.module('commonComponents',[])

.directive('user', function() {
	var userComponentScope = scopeDefinition;
	userComponentScope.password = "<";
	return{
		scope: scopeDefinition,
		restrict:'E',
		templateUrl: 'common/components/templates/user.html'
	};
})

.directive('userRoles', function() {
	return{
		scope: scopeDefinition,
		restrict:'E',
		templateUrl: 'common/components/templates/user-roles.html'
	};
})

.directive('personName', function() {
	return{
		scope: scopeDefinition,
		restrict:'E',
		templateUrl: 'common/components/templates/person-name.html'
	};
})
.directive('personJob', function() {
	return{
		scope: scopeDefinition,
		restrict:'E',
		templateUrl: 'common/components/templates/person-job.html'
	};
})

.directive('organization', function() {
	return{
		scope: scopeDefinition,
		restrict:'E',
		templateUrl: 'common/components/templates/organization.html'
	};
})

.directive('phones', function() {
	return{
		scope: scopeDefinition,
		restrict:'E',
		templateUrl: 'common/components/templates/phones.html',
		controller: function ($scope) {
			$scope.phoneTypes = ['HOME', 'WORK', 'MOBILE', 'FAX', 'OTHER'];

			$scope.addNewPhone = function() {
				$scope.data.setContactMethod('work', new PhoneNumber());
			};

			$scope.removePhone = function(z) {
				$scope.data.contactMethods.phones.splice(z,1);
			};
		}
	};
})
.directive('emails', function() {
	return{
		scope: scopeDefinition,
		restrict:'E',
		templateUrl: 'common/components/templates/emails.html',
		controller: function ($scope) {
			$scope.mailTypes = ['PERSONAL', 'WORK', 'OTHER'];

			$scope.addNewMail = function() {
				$scope.data.setContactMethod('work', new Email());
			};

			$scope.removeMail = function(z) {
				$scope.data.contactMethods.emails.splice(z,1);
			};
		}
	};
})
.directive('addresses', function() {
	return{
		scope: scopeDefinition,
		restrict:'E',
		templateUrl: 'common/components/templates/addresses.html',
		controller: function ($scope) {
			$scope.addressTypes = ['HOME', 'WORK', 'OTHER'];

			$scope.addNewAddress = function() {
				$scope.data.setContactMethod('work', new PostalAddress());
			};

			$scope.removeAddress = function(z) {
				$scope.data.contactMethods.addresses.splice(z,1);
			};
		}
	};
});