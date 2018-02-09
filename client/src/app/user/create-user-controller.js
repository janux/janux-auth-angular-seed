'use strict';

var Person = require('janux-people').Person;
var Email = require('janux-people').EmailAddress;
var md5 = require('md5');
var _ = require('lodash');

module.exports = [
'$scope','userService','roles','$modal','$filter', function(
 $scope , userService , roles , $modal , $filter) {

		var user = 	{
			username: '',
			password: '',
			roles: [],
			enabled: true
		};
		$scope.roles = roles;

		$scope.currentNavItem = 'user';

		// Create a new person
		var person = new Person();
		// person.setContactMethod('work', new PhoneNumber());
		person.setContactMethod('work', new Email());
		// person.setContactMethod('Home', new PostalAddress());

		user.contact = person;
		$scope.user = user;

		var infoDialog = function (translateKey) {
			$modal.open({
				templateUrl: 'app/dialog-tpl/info-dialog.html',
				controller : ['$scope', '$modalInstance',
					function ($scope, $modalInstance) {
						$scope.message = $filter('translate')(translateKey);

						$scope.ok = function () {
							$modalInstance.close();
						};
					}],
				size       : 'md'
			});
		};

		$scope.save = function () {
			if(!_.isNil($scope.user.password) && !_.isNil($scope.user.username) ) {

				$scope.roles.forEach(function (role) {
					if(role.enabled) {
						$scope.user.roles.push(role.name);
					}
				});

				if($scope.user.roles.length > 0) {
					if($scope.user.contact.contactMethods.emails[0].address) {
						if(!_.isNil($scope.user.contact.name.first) && !_.isNil($scope.user.contact.name.first)){

							console.log('user created', $scope.user);
							$scope.user.password = md5($scope.user.password);
							userService.saveOrUpdate($scope.user).then(function (resp) {
								console.log('User has been saved!', resp);
								window.history.back();
							});

						} else {
							$scope.currentNavItem = 'contact';
							infoDialog('user.dialogs.nameEmpty');
						}
					} else {
						infoDialog('user.dialogs.emailEmpty');
					}
				} else {
					infoDialog('user.dialogs.noRoles');
				}

			}

		};

		$scope.cancel = function () {
			window.history.back();
		};
	}];