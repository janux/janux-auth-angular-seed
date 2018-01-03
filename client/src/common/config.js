'use strict';

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
						translate: 'peopleOrgs.users'
					},
					staff: {
						state: 'staff',
						translate: 'peopleOrgs.staff'
					},
					clients: {
						state: 'clients',
						translate: 'peopleOrgs.clients'
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
						translate: 'operations.drivers'
					},
					specials: {
						state: 'operations.specials',
						translate: 'operations.specials'
					},
					guards: {
						state: 'operations.guards',
						translate: 'operations.guards'
					},
					services: {
						state: 'operations.services',
						translate: 'operations.services'
					}
				}
			},
			{
				key: 'authSchema',
				translateKey: 'authSchema.title',
				iconClass: 'fa-sitemap',
				state: 'permissions',
				subOptions: {
					roles: {
						state: 'permissions.roles',
						translate: 'authSchema.roles'
					},
					authorizations: {
						state: 'permissions.auth-contexts',
						translate: 'authSchema.authorizations'
					}
				}
			}
		]
	});
