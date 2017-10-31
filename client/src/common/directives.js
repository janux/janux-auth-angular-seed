angular.module('commonDirectives',[])

// .directive('logoBar', function() {
// 	return {
// 		restrict: 'E',
// 		templateUrl: 'app/logo-bar.html'
// 	};
// })

.directive('sideBar',['$templateRequest','$compile', function($templateRequest, $compile) {
	return {
		restrict: 'E',
		// templateUrl: 'app/side-bar.html'
		link: function(scope, element){
			$templateRequest('app/nav-bar.html').then(function(html){
				var template = angular.element(html);

				var sideBarNav = angular.element('<div/>');
				sideBarNav.addClass('sidebar-nav');
				sideBarNav.html($compile(template)(scope));

				var sideBar = angular.element('<div/>');
				sideBar.addClass('sidebar');
				sideBar.html($compile(sideBarNav)(scope));

				element.html($compile(sideBar)(scope));
			});
		}
	};
}])

.directive('footerJanux', function() {
	return{
		restrict:'E',
		templateUrl: 'app/footer.html'
	};
})

//
// It can be used instead of ng-click when the element is within ng-repeat,
// usually ng-click fails in this context in iOS
//
.directive("ngMobileClick", [function () {
	return function (scope, elem, attrs) {
		elem.bind("touchstart click", function (e) {
			e.preventDefault();
			e.stopPropagation();

			scope.$apply(attrs["ngMobileClick"]);
		});
	}
}]);