'use strict';

var moment = require('moment');

require('angular').module('config', [])
	.value('config', {
		// the state on which we should land by default, or upon login
		defaultState: 'operations.drivers',
		mainMenu: [
			{
				key: 'peopleOrgs',
				translateKey: 'peopleOrgs.title',
				iconClass: 'fa-users',
				state: 'users',
				subOptions: {
					users: {
						state: 'users',
						translate: 'peopleOrgs.users',
						authContext: 'USER'
					},
					staff: {
						state: 'staff',
						translate: 'peopleOrgs.staff',
						authContext: 'STAFF'
					},
					clients: {
						state: 'client',
						translate: 'peopleOrgs.clients',
						authContext: 'CLIENT'
					}
				}
			},
			{
				key: 'operations',
				translateKey: 'operations.title',
				iconClass: 'fa-archive',
				state: 'operations',
				subOptions: {
					drivers: {
						state: 'operations.drivers',
						translate: 'operations.drivers',
						authContext: 'TIME_ENTRY_DRIVER'
					},
					specials: {
						state: 'operations.specials',
						translate: 'operations.specials',
						authContext: 'TIME_ENTRY_OPS'
					},
					guards: {
						state: 'operations.guards',
						translate: 'operations.guards',
						authContext: 'TIME_ENTRY_GUARD'
					},
					
				}
			},
			{
				key: 'services',
				translateKey: 'services.title',
				iconClass: 'fa-tachometer',
				state: 'services',
				subOptions: {}
			},
			{
				key: 'authSchema',
				translateKey: 'authSchema.title',
				iconClass: 'fa-sitemap',
				state: 'permissions',
				subOptions: {
					roles: {
						state: 'permissions.roles',
						translate: 'authSchema.roles',
						authContext: 'ROLE'
					},
					authorizations: {
						state: 'permissions.auth-contexts',
						translate: 'authSchema.authorizations',
						authContext: 'AUTH_CONTEXT'
					}
				}
			}
		],
		periodFilter: [
			{
				key: 'last7Days',
				label: 'periodFilter.last7Days'
			},
			{
				key: 'currentWeek',
				label: 'periodFilter.currentWeek'
			},
			{
				key: 'lastWeek',
				label: 'periodFilter.lastWeek'
			},
			{
				key: 'last30Days',
				label: 'periodFilter.last30Days'
			},
			{
				key: 'currentMonth',
				label: 'periodFilter.currentMonth'
			},
			{
				key: 'lastMonth',
				label: 'periodFilter.lastMonth'
			},
			{
				key: 'last90Days',
				label: 'periodFilter.last90Days'
			},
			{
				key: 'currentQuarter',
				label: 'periodFilter.currentQuarter'
			},
			{
				key: 'lastQuarter',
				label: 'periodFilter.lastQuarter'
			}
		]
	});
