"use strict";

var Promise = require("bluebird");
var log = require('log4js');
var util = require('util');
var _ = require('lodash');
var AuthContextMongooseDbSchema = require("janux-persist").AuthContextMongooseDbSchema;
var RoleMongooseDbSchema = require("janux-persist").RoleMongooseDbSchema;
var GroupMongooseSchema = require("janux-persist").GroupMongooseSchema;
var GroupContentMongooseSchema = require("janux-persist").GroupContentMongooseSchema;
var GroupAttributeValueMongooseSchema = require("janux-persist").GroupAttributeValueMongooseSchema;
var AuthContextDaoMongooseImpl = require("janux-persist").AuthContextDaoMongooseImpl;
var RoleDaoLokiJsImpl = require("janux-persist").RoleDaoLokiJsImpl;
var AuthContextDaoLokiJsImpl = require("janux-persist").AuthContextDaoLokiJsImpl;
var RoleDaoMongooseImpl = require("janux-persist").RoleDaoMongooseImpl;
var GroupDao = require("janux-persist").GroupDao;
var GroupContentDao = require("janux-persist").GroupContentDao;
var GroupAttributeValueDao = require("janux-persist").GroupAttributeValueDao;

var Role = require('janux-authorize').Role;
var AuthorizationContext = require('janux-authorize').AuthorizationContext;
var DaoFactory = require('janux-persist').DaoFactory;
var DaoSettings = require('janux-persist').DaoSettings;
var EntityPropertiesImpl = require('janux-persist').EntityPropertiesImpl;
var DataSourceHandler = require('janux-persist').DataSourceHandler;
var AuthContextService = require('janux-persist').AuthContextService;
var AuthContextGroupService = require('janux-persist').AuthContextGroupServiceImpl;
var GroupService = require('janux-persist').GroupServiceImpl;
var GroupImpl = require('janux-persist').GroupImpl;
var RoleService = require('janux-persist').RoleService;

const AUTHCONTEXT_DEFAULT_COLLECTION_NAME      = 'authcontext',
	  ROLE_DEFAULT_COLLECTION_NAME             = 'role',
	  GROUP_DEFAULT_COLLECTION_NAME            = 'group',
	  GROUP_CONTENT_DEFAULT_COLLECTION_NAME    = 'groupContent',
	  GROUP_ATTRIBUTES_DEFAULT_COLLECTION_NAME = "groupAttribute";

var AuthGenerator = (function () {

    function AuthGenerator() {}

    AuthGenerator.generateAuthDataInTheDatabase = function (dbEngine, path) {
        this._log.debug("Call to generateAuthDataInTheDatabase");

		var authContextDao;
		var roleDao;
		var groupContentDao;
		var groupDao;
		var groupAttributeValueDao;

		if (dbEngine === DataSourceHandler.MONGOOSE) {
			authContextDao = DaoFactory.subscribeDao(new DaoSettings(dbEngine, path, AUTHCONTEXT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), AuthContextMongooseDbSchema), AuthContextDaoMongooseImpl);
			roleDao = DaoFactory.subscribeDao(new DaoSettings(dbEngine, path, ROLE_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), RoleMongooseDbSchema), RoleDaoMongooseImpl);
			groupDao = DaoFactory.subscribeDao(new DaoSettings(dbEngine, path, GROUP_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), GroupMongooseSchema), GroupDao);
			groupContentDao = DaoFactory.subscribeDao(new DaoSettings(dbEngine, path, GROUP_CONTENT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), GroupContentMongooseSchema), GroupContentDao);
			groupAttributeValueDao = DaoFactory.subscribeDao(new DaoSettings(dbEngine, path, GROUP_ATTRIBUTES_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), GroupAttributeValueMongooseSchema), GroupAttributeValueDao);
		} else if (dbEngine === DataSourceHandler.LOKIJS) {
			authContextDao = DaoFactory.subscribeDao(new DaoSettings(dbEngine, path, AUTHCONTEXT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), AuthContextDaoLokiJsImpl);
			roleDao = DaoFactory.subscribeDao(new DaoSettings(dbEngine, path, ROLE_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), RoleDaoLokiJsImpl);
			groupContentDao = DaoFactory.subscribeDao(new DaoSettings(dbEngine, path, GROUP_CONTENT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), GroupContentDao);
			groupDao = DaoFactory.subscribeDao(new DaoSettings(dbEngine, path, GROUP_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), GroupDao);
			groupAttributeValueDao = DaoFactory.subscribeDao(new DaoSettings(dbEngine, path, GROUP_ATTRIBUTES_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), GroupAttributeValueDao);
		}


		// authContextDao = daoFactory.createAuthContextDao(dbEngine, path);
		// roleDao = daoFactory.createRoleDao(dbEngine, path);
		// groupContentDao = daoFactory.createGroupContentDao(dbEngine, path);
		// groupDao = daoFactory.createGroupDao(dbEngine, path);
		// groupAttributeValueDao = daoFactory.createGroupAttributesDao(dbEngine, path);

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