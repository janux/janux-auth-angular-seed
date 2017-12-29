'use strict';


module.exports = [
	'$scope', 'staff', 'partyService', 'partyGroupService', function ($scope, staff, partyService, partyGroupService) {

		$scope.staffList = staff;
		console.log('Staff:', staff);

		$scope.init = function () {
			partyService.findPeople()
				.then(function (result) {
					$scope.staffList = result;


					var code = 'testCode';
					partyGroupService.findOne(code)
						.then(function (result) {
							if (result) {
								console.log('Inserted group');
								console.log(JSON.stringify(result));
								console.log('Removing group');
								partyGroupService.remove(code);

							} else {
								console.log('Inserting group');
								var group = {
									type       : 'custom list',
									code       : code,
									name       : 'custom group',
									description: 'description',
									attributes : {
										att1: 'att1'
									},
									values     : [
										{
											attributes: {a: 'a'},
											party     : $scope.staffList[0]
										},
										{
											attributes: {a: 'b'},
											party     : $scope.staffList[1]
										}
									]
								};

								partyGroupService.insert('10000', group)
									.then(function (result) {
										console.log('Inserted group');
										console.log(JSON.stringify(result));
										console.log('Adding item');
										return partyGroupService.addItem(code, {
											attributes: {a: 'b'},
											party     : $scope.staffList[2]
										});
									})
									.then(function () {
										console.log('Item added');
									});
							}
						});


				});


		};

		$scope.init();
	}];