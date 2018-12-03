'use strict';

var _ = require('lodash');

require('common/demoService');

require('angular').module('appStaff', [
	'demoService'
])

	.config(['$stateProvider', function ($stateProvider) {
		$stateProvider.state('staff', {
			url         : '/staff',
			template    : '<ui-view/>',
			authRequired: true,
			redirectTo  : 'staff.list'
		})
			.state('staff.list', {
				url         : '/staff-list',
				templateUrl : 'app/staff/index.html',
				authRequired: true,
				controller  : require('./staff-controller.js'),
				resolve     : {
					supplier           : ['config', 'partyService', function (config, partyService) {
						return partyService.findOne(config.glarus);
					}],
					assignableResources: ['config', 'resourceService', function (config, resourceService) {
						return resourceService.findAvailableResourcesByVendor(config.glarus);
					}],
					staffList          : ['partyGroupService', 'assignableResources', 'userService', 'security', 'userInvService', 'partyService', function (partyGroupService, assignableResources, userService, security, userInvService, partyService) {
						var parties;
						return partyGroupService.findOne('glarus_staff_group')
							.then(function (result) {
								// console.log('result ' + JSON.stringify(result));
								//console.log('staff list', result.values);
								parties = _.map(result.values, function (o) {

									var resource = _.find(assignableResources, function (res) {
										return res.resource.id === o.party.id;
									});
									o.party.isAvailable = _.isNil(resource) === false;

									var last = (_.isNil(o.party.name.last)) ? '' : o.party.name.last;
									var maternal = (_.isNil(o.party.name.maternal)) ? '' : o.party.name.maternal;
									var first = (_.isNil(o.party.name.first)) ? '' : o.party.name.first;
									var middle = (_.isNil(o.party.name.middle)) ? '' : o.party.name.middle;
									var phone = '';
									var email = '';
									var user = (_.isNil(o.party.user)) ? '' : o.party.user;

									if (_.isArray(o.party.contactMethods.phones) && o.party.contactMethods.phones.length > 0) {
										if (o.party.contactMethods.phones[0].number === undefined) {
											phone = '';
										} else {
											phone = o.party.phoneNumber().countryCode + ' ' + o.party.phoneNumber().areaCode + ' ' + o.party.phoneNumber().number;
										}
									} else {
										phone = '';
									}

									email = partyService.getDefaultEmailAddress(o.party);

									o.party.staffDisplayFirstName = first + ' ' + middle;
									o.party.staffDisplayLastName = last + ' ' + maternal;
									o.party.staffDisplayPhone = phone;
									o.party.staffDisplayEmail = email;
									o.party.staffDisplayUser = user;
									o.party.availableColumn = {staffId: o.party.id, isAvailable: o.party.isAvailable};

									return o.party;

								});
								// return parties;
								return userService.findBy('username', '', security.currentUser.username);
							})
							.then(function (users) {
								parties = _.map(parties, function (party) {
									party.user = _.find(users, function (o) {
										return party.id === o.userId;
									});
									return party;
								});

								var userIds = _.map(users, 'userId');
								return userInvService.findByAccountIdsIn(userIds);
								// return parties;
							})
							.then(function (invitations) {
								parties = _.map(parties, function (party) {
									if (!_.isNil(party.user)) {
										party.user.invitation = _.find(invitations, function (o) {
											return party.user.userId === o.accountId;
										});
									}
									return party;
								});
								return parties;
							});
					}]
				}
			})

			// Create Staff Member
			.state('staff.create', {
				url         : '/staff-create',
				templateUrl : 'app/staff/create-staff.html',
				authRequired: true,
				controller  : require('./staff-create-controller.js'),
				resolve     : {}
			})

			// Edit specific staff member
			.state('staff.edit', {
				url         : '/staff/{id}',
				templateUrl : 'app/staff/edit-staff.html',
				authRequired: true,
				controller  : require('./edit-staff-controller.js'),
				resolve     : {
					staff: ['partyService', '$stateParams', function (partyService, $stateParams) {
						return partyService.findOne($stateParams.id);
					}]
				}
			});
	}]);
