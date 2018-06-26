'use strict';

require('angular').module('config', [])
	.value('config', {
		// the state on which we should land by default, or upon login
		defaultState          : 'operations.drivers',
		defaultStateClient    : 'operations.specials',
		glarus                : '10000',
		mainMenu              : [
			{
				key         : 'peopleOrgs',
				translateKey: 'peopleOrgs.title',
				iconClass   : 'fa-users',
				state       : 'users',
				subOptions  : {
					users    : {
						state      : 'users',
						translate  : 'peopleOrgs.users',
						authContext: 'USER'
					},
					staff    : {
						state      : 'staff',
						translate  : 'peopleOrgs.staff',
						authContext: 'STAFF'
					},
					clients  : {
						state      : 'client',
						translate  : 'peopleOrgs.clients',
						authContext: 'CLIENT'
					},
					suppliers: {
						state      : 'supplier',
						translate  : 'peopleOrgs.suppliers',
						authContext: 'SUPPLIERS'
					}
				}
			},
			{
				key         : 'operations',
				translateKey: 'operations.title',
				iconClass   : 'fa-archive',
				state       : 'operations',
				subOptions  : {
					drivers : {
						state      : 'operations.drivers',
						translate  : 'operations.drivers',
						authContext: 'TIME_ENTRY_DRIVER'
					},
					specials: {
						state      : 'operations.specials',
						translate  : 'operations.specials',
						authContext: 'TIME_ENTRY_OPS'
					},
					guards  : {
						state      : 'operations.guards',
						translate  : 'operations.guards',
						authContext: 'TIME_ENTRY_GUARD'
					},

					attendance: {
						state      : 'operations.attendance',
						translate  : 'operations.attendance',
						authContext: 'TIME_ENTRY_ATTENDANCE'
					}

				}
			},
			{
				key         : 'services',
				translateKey: 'services.title',
				iconClass   : 'fa-tachometer',
				state       : 'services',
				authContext: 'SERVICE',
				subOptions  : {}
			},
			{
				key         : 'authSchema',
				translateKey: 'authSchema.title',
				iconClass   : 'fa-sitemap',
				state       : 'permissions',
				subOptions  : {
					roles         : {
						state      : 'permissions.roles',
						translate  : 'authSchema.roles',
						authContext: 'ROLE'
					},
					authcontexts: {
						state      : 'permissions.authcontexts',
						translate  : 'authSchema.authorizations',
						authContext: 'AUTH_CONTEXT'
					}
				}
			}
		],
		mainMenuClient        : [
			{
				key         : 'peopleOrgs',
				translateKey: 'peopleOrgs.title',
				iconClass   : 'fa-users',
				state       : 'users',
				subOptions  : {
					users    : {
						state      : 'users',
						translate  : 'peopleOrgs.users',
						authContext: 'USER'
					},
					staffClient: {
						state      : 'staffClient',
						translate  : 'peopleOrgs.contacts',
						authContext: 'CLIENT_CONTACT'
					}
				}
			},
			{
				key         : 'operations',
				translateKey: 'operations.title',
				iconClass   : 'fa-archive',
				state       : '',
				subOptions  : {
					drivers : {
						state      : 'operations.drivers',
						translate  : 'operations.drivers',
						authContext: 'TIME_ENTRY_DRIVER'
					},
					specials: {
						state      : 'operations.specials',
						translate  : 'operations.specials',
						authContext: 'TIME_ENTRY_OPS'
					},
					guards  : {
						state      : 'operations.guards',
						translate  : 'operations.guards',
						authContext: 'TIME_ENTRY_GUARD'
					}
				}
			},
			{
				key         : 'services',
				translateKey: 'services.title',
				iconClass   : 'fa-tachometer',
				state       : 'services',
				subOptions  : {}
			}
		],
		functions: {
			FUNCTION_DRIVER : "DRIVER",
			FUNCTION_AGENT : "AGENT",
			FUNCTION_AGENT_ARMED : "AGENT_ARMED",
			FUNCTION_COORDINATOR : "COORDINATOR",
			FUNCTION_GREETER : "GREETER",
			FUNCTION_GUARD : "GUARD",
			FUNCTION_GUARD_SUPPORT : "GUARD_SUPPORT",
			FUNCTION_GUARD_SHIFT_MANAGER : "GUARD_SHIFT_MANAGER",
			FUNCTION_GUARD_NIGHT_SHIFT_MAINTENANCE : "GUARD_NIGHT_SHIFT_MAINTENANCE",
			FUNCTION_GUARD_GOODS_RECEIPT : "GUARD_GOODS_RECEIPT"
		},
		periodFilter          : [
			{
				key  : 'last7Days',
				label: 'periodFilter.last7Days'
			},
			{
				key  : 'currentWeek',
				label: 'periodFilter.currentWeek'
			},
			{
				key  : 'lastWeek',
				label: 'periodFilter.lastWeek'
			},
			{
				key  : 'last30Days',
				label: 'periodFilter.last30Days'
			},
			{
				key  : 'currentMonth',
				label: 'periodFilter.currentMonth'
			},
			{
				key  : 'lastMonth',
				label: 'periodFilter.lastMonth'
			},
			{
				key  : 'last90Days',
				label: 'periodFilter.last90Days'
			},
			{
				key  : 'currentQuarter',
				label: 'periodFilter.currentQuarter'
			},
			{
				key  : 'lastQuarter',
				label: 'periodFilter.lastQuarter'
			}
		],
		periodFilterSpecialOps: [
			{
				key  : 'last7Days',
				label: 'periodFilter.last7Days'
			},
			{
				key  : 'currentWeek',
				label: 'periodFilter.currentWeek'
			},
			{
				key  : 'lastWeek',
				label: 'periodFilter.lastWeek'
			},
			{
				key  : 'last30Days',
				label: 'periodFilter.last30Days'
			},
			{
				key  : 'currentMonth',
				label: 'periodFilter.currentMonth'
			},
			{
				key  : 'lastMonth',
				label: 'periodFilter.lastMonth'
			},
			{
				key  : 'last90Days',
				label: 'periodFilter.last90Days'
			},
			{
				key  : 'currentQuarter',
				label: 'periodFilter.currentQuarter'
			},
			{
				key  : 'lastQuarter',
				label: 'periodFilter.lastQuarter'
			},
			{
				key  : 'oneYear',
				label: 'periodFilter.oneYear'
			},
			{
				key  : 'yearToDate',
				label: 'periodFilter.yearToDate'
			},
			{
				key  : 'lastYear',
				label: 'periodFilter.lastYear'
			}
		]
	});
