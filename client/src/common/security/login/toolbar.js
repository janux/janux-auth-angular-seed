'use strict';

//
// The loginToolbar directive is a reusable widget that can show login or logout buttons
// and information the current authenticated user
//
module.exports = ['security','environmentService', function(security, environmentService) {
	var directive = {
		templateUrl: '/common/security/login/toolbar.html',
		restrict: 'E',
		replace:	true,
		scope:		true,
		link: function($scope, $element, $attrs, $controller) {
			$scope.title = $attrs['toolbarTitle'];
			$scope.isAuthenticated = security.isAuthenticated;
			$scope.login	= security.showLogin;
			$scope.logout = security.logout;
			$scope.$watch(function() {
				return security.currentUser;
			}, function(currentUser) {
				$scope.currentUser = currentUser;
			});

			environmentService.getEnvironmentInfo().then(function (envInfo) {
				$scope.devEnv = (envInfo.environment==='development');
			});
		}
	};
	return directive;
}];
