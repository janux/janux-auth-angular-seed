'use strict';

var  _ = require('lodash');

require('common/demoService');

require('angular').module('appStaff', [
	'demoService'
])

.config(['$stateProvider', function($stateProvider)
{
	$stateProvider.state('staff', {
		url: '/staff',
		template: '<ui-view/>',
		authRequired: true,
		redirectTo: 'staff.list'
	})
	.state('staff.list', {
		url: '/staff-list',
		templateUrl: 'app/staff/index.html',
		authRequired: true,
		controller: require('./staff-controller.js'),
		resolve: {
			supplier:['config','partyService',function(config, partyService){
				return partyService.findOne(config.glarus);
			}],
			assignableResources:['config','resourceService',function(config,resourceService){
				return resourceService.findAvailableResourcesByVendor(config.glarus);
			}],
			staffList:['partyGroupService','assignableResources', function(partyGroupService,assignableResources){
				return partyGroupService.findOne('glarus_staff_group')
				.then(function (result) {
					// console.log('result ' + JSON.stringify(result));
					//console.log('staff list', result.values);
					var parties = _.map(result.values, function (o) {

						var resource = _.find(assignableResources, function (res) {
							return res.resource.id === o.party.id;
						});
						o.party.isAvailable = _.isNil(resource) === false;

						var last=(_.isNil(o.party.name.last))?'':o.party.name.last;
						var maternal=(_.isNil(o.party.name.maternal))?'':o.party.name.maternal;
						var first=(_.isNil(o.party.name.first))?'':o.party.name.first;
						var middle=(_.isNil(o.party.name.middle))?'':o.party.name.middle;
						var phone = '';
						var email = '';
						var area=(_.isNil(o.party.area))?'':o.party.area;
						var user=(_.isNil(o.party.user))?'':o.party.user;
						
						if(_.isArray(o.party.contactMethods.phones) &&  o.party.contactMethods.phones.length>0 ){
							phone= o.party.contactMethods.phones[0].number;
						}else{
							phone= '';
						}

						if(_.isArray(o.party.contactMethods.emails) &&  o.party.contactMethods.emails.length>0 ){
							email= o.party.contactMethods.emails[0].address;
						}else{
							email= '';
						}

						o.party.staffDisplayFirstName = first+' '+middle;
						o.party.staffDisplayLastName = last+' '+maternal;
						o.party.staffDisplayPhone = phone;
						o.party.staffDisplayEmail = email;
						o.party.staffDisplayArea = area;
						o.party.staffDisplayUser = user;
						o.party.availableColumn = {staffId:o.party.id,isAvailable:o.party.isAvailable};
						
						return o.party;
					});
					return parties;
				});
			}]
		}
	})

	// Create Staff Member
	.state('staff.create', {
		url: '/staff-create',
		templateUrl: 'app/staff/create-staff.html',
		authRequired: true,
		controller: require('./staff-create-controller.js'),
		resolve: {}
	})

	// Edit specific staff member
	.state('staff.edit', {
		url: '/staff/{id}',
		templateUrl: 'app/staff/edit-staff.html',
		authRequired: true,
		controller: require('./edit-staff-controller.js'),
		resolve: {
			staff: ['partyService', '$stateParams', function(partyService, $stateParams){
				return partyService.findOne($stateParams.id);
			}]
		}
	});
}]);