"use strict";

var Promise = require("bluebird");
var log = require('log4js');
var util = require('util');
var _ = require('lodash');

var Role = require('janux-authorize').Role;
var AuthorizationContext = require('janux-authorize').AuthorizationContext;
var daoFactory = require('janux-persist').DaoFactory;
var AuthContextService = require('janux-persist').AuthContextService;
var AuthContextGroupService = require('janux-persist').AuthContextGroupServiceImpl;
var GroupService = require('janux-persist').GroupServiceImpl;
var GroupImpl = require('janux-persist').GroupImpl;
var RoleService = require('janux-persist').RoleService;

var AuthGenerator = (function () {
    
    function AuthGenerator() {}
    
    AuthGenerator.generateAuthDataInTheDatabase = function (dbEngine, path) {
        this._log.debug("Call to generateAuthDataInTheDatabase");
        
        var authContextDao = daoFactory.createAuthContextDao(dbEngine, path);
        var roleDao = daoFactory.createRoleDao(dbEngine, path);
		var groupContentDao = daoFactory.createGroupContentDao(dbEngine, path);
		var groupDao = daoFactory.createGroupDao(dbEngine, path);
		var groupAttributeValueDao = daoFactory.createGroupAttributesDao(dbEngine, path);
		var groupService = new GroupService(groupDao, groupContentDao, groupAttributeValueDao);
		var authContextService = AuthContextService.createInstance(authContextDao);
		var authContextGroupService = new AuthContextGroupService(authContextService, groupService);
		var roleService = RoleService.createInstance(roleDao);

		var authDataToInsert = this.generateAuthData();

		var inserted = new Promise(function(resolve) {

			// Wait for lokijs to initialize
			setTimeout(function() {
				var authContextToInsert = [],
					roleToInsert = [];

				for(var iContext in authDataToInsert.authorizationContexts){
					authContextToInsert.push(
						authContextService.insert(authDataToInsert.authorizationContexts[iContext].toJSON())
					);
				}

				for(var iRole in authDataToInsert.roles){
					roleToInsert.push(
						roleService.insert(authDataToInsert.roles[iRole].toJSON())
					);
				}

				return Promise.all(authContextToInsert).then(function (insertedAuthContext) {
					// Create Authorization context group
					var groupToInsert = [];
					var iContext = [[0,1],[2,3]];

					for(var iACGroup in authDataToInsert.authContextGroup) {
						var group = new GroupImpl();
						group.name = authDataToInsert.authContextGroup[iACGroup].name;
						group.description = authDataToInsert.authContextGroup[iACGroup].description;
						group.code = authDataToInsert.authContextGroup[iACGroup].code;
						group.attributes = {parent: "root"};
						group.values = [
							insertedAuthContext[iContext[iACGroup][0]],
							insertedAuthContext[iContext[iACGroup][1]]
						];
						groupToInsert.push( authContextGroupService.insert(group) );
					}

					return Promise.all(groupToInsert).then(function () {
						return Promise.all(roleToInsert).then(function (insertedRole) {
							resolve(insertedAuthContext.concat(insertedRole));
						});
					});
				});
			},10);
		});

		return inserted;

    };
    
    AuthGenerator.generateAuthData = function () {
        this._log.debug("Call to generateAuthData");

		var authData = {};

		//
		// Defining the AuthorizationContexts programatically
		//
		authData.authorizationContexts = {};

		authData.authContextGroup = [
			{
				name: 'People',
				description: 'Grouping authorization contexts related to people',
				code: 'PEOPLE'
			},
			{
				name: 'Security',
				description: 'Grouping authorization contexts related to security',
				code: 'SECURITY'
			}
		];

		var standardPermissionBits = ['READ', 'UPDATE', 'CREATE', 'DELETE', 'PURGE'];

		//
		// Defining the Roles programmatically
		//
		authData.roles = {};

		//
		// private variable used to setup standard authorization contexts to be added
		// further below via addStandardAuthorizationContext
		//
		var standardAuthContextSetup = {
			WIDGET:       'Widget that we want to track in our system',
			USER:         'User in our system',
			ROLE:         'Role in our system or business domain',
			AUTH_CONTEXT: 'Authorization Metadata for our system or business domain'
		};

		_.each(standardAuthContextSetup, function(represents, name) {
			authData.authorizationContexts[name] = AuthorizationContext.createInstance(
				name, 'Defines permissions available on a ' + represents,
				standardPermissionBits
			);
		});

		//
		// Define a non-standard 'GRANT' permission in the USER AuthorizationContext
		//
		authData.authorizationContexts['USER'].addPermissionBit('GRANT', util.format('Grants permission to GRANT authorizations to Users in our system'));

		authData.roles.WIDGET_DESIGNER = Role.createInstance('WIDGET_DESIGNER', 'A person who creates and edits widget information')
			.grant(['READ','UPDATE','CREATE','DELETE'], authData.authorizationContexts.WIDGET)
		;

		// console.log('roles.WIDGET_DESIGNER:', JSON.stringify(roles.WIDGET_DESIGNER));

		authData.roles.MANAGER = Role.createInstance('MANAGER', 'A Manager who can manage Widgets and Users')
			.grant(['READ','UPDATE','CREATE','DELETE'],         authData.authorizationContexts.WIDGET)
			.grant(['READ','UPDATE','CREATE','DELETE','GRANT'], authData.authorizationContexts.USER)
		;

		// console.log('roles.MANAGER:', JSON.stringify(roles.MANAGER));

		authData.roles.SECURITY_MANAGER = Role.createInstance('SECURITY_MANAGER', 'A Person who can manage users and the authorization schema')
			.grant(['READ','UPDATE','CREATE','DELETE'],         authData.authorizationContexts.AUTH_CONTEXT)
			.grant(['READ','UPDATE','CREATE','DELETE'],         authData.authorizationContexts.ROLE)
			.grant(['READ','UPDATE','CREATE','DELETE','GRANT'], authData.authorizationContexts.USER)
		;

		authData.roles.ADMIN = Role.createInstance('ADMIN', 'Staff person with all privileges');
		authData.roles.ADMIN.isAlmighty = true;


        // this._log.debug("Returning %j", authData);
        return authData;
    };

    AuthGenerator._log = log.getLogger('AuthGenerator');
    
    return AuthGenerator;
}());

exports.AuthGenerator = AuthGenerator;