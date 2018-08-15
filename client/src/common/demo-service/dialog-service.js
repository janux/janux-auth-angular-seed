'use strict';
var _ = require('lodash');

/**
 * Common dialog service
 */

module.exports = ['$modal','$filter', function ($modal, $filter) {

	var service = {

		info: function (translateKey) {
			$modal.open({
				templateUrl: 'app/dialog-tpl/info-dialog.html',
				controller: ['$scope', '$modalInstance',
					function ($scope, $modalInstance) {
						$scope.message = $filter('translate')(translateKey);

						$scope.ok = function () {
							$modalInstance.close();
						};
					}],
				size: 'md'
			});
		}
	};

	return service;
}];
