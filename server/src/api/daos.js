'use strict';

var config               = require('config').serverAppContext,
	DataSourceHandler    = require('janux-persist').DataSourceHandler,
	DaoFactory           = require('janux-persist').DaoFactory,
	EntityPropertiesImpl = require('janux-persist').EntityPropertiesImpl,
	DaoSettings          = require('janux-persist').DaoSettings,
	dbEngine             = config.db.dbEngine,
	pathLoki             = config.db.lokiJsDBPath,
	pathMongo            = config.db.mongoConnUrl;


const PartyDaoMongooseImpl       = require('janux-persist').PartyDaoMongooseImpl,
	  StaffDao                   = require('janux-persist').StaffDataDao,
	  AccountDaoMongooseImpl     = require('janux-persist').AccountDaoMongooseImpl,
	  AuthContextDaoMongooseImpl = require('janux-persist').AuthContextDaoMongooseImpl,
	  RoleDaoMongooseImpl        = require('janux-persist').RoleDaoMongooseImpl,
	  GroupDao                   = require('janux-persist').GroupDao,
	  GroupContentDao            = require('janux-persist').GroupContentDao,
	  GroupAttributeValueDao     = require('janux-persist').GroupAttributeValueDao,
	  PartyDaoLokiJsImpl         = require('janux-persist').PartyDaoLokiJsImpl,
	  AccountDaoLokiJsImpl       = require('janux-persist').AccountDaoLokiJsImpl,
	  AuthContextDaoLokiJsImpl   = require('janux-persist').AuthContextDaoLokiJsImpl,
	  RoleDaoLokiJsImpl          = require('janux-persist').RoleDaoLokiJsImpl;

const PartyMongooseSchema               = require('janux-persist').PartyMongooseSchema,
	  StaffDataMongooseDbSchema         = require('janux-persist').StaffDataMongooseDbSchema,
	  AccountMongooseDbSchema           = require('janux-persist').AccountMongooseDbSchema,
	  AuthContextMongooseDbSchema       = require('janux-persist').AuthContextMongooseDbSchema,
	  RoleMongooseDbSchema              = require('janux-persist').RoleMongooseDbSchema,
	  GroupMongooseSchema               = require('janux-persist').GroupMongooseSchema,
	  GroupContentMongooseSchema        = require('janux-persist').GroupContentMongooseSchema,
	  GroupAttributeValueMongooseSchema = require('janux-persist').GroupAttributeValueMongooseSchema;

const PARTY_DEFAULT_COLLECTION_NAME            = 'contact',
	  STAFF_COLLECTION_NAME                    = 'staff',
	  ACCOUNT_DEFAULT_COLLECTION_NAME          = 'account',
	  AUTHCONTEXT_DEFAULT_COLLECTION_NAME      = 'authcontext',
	  ROLE_DEFAULT_COLLECTION_NAME             = 'role',
	  GROUP_DEFAULT_COLLECTION_NAME            = 'group',
	  GROUP_CONTENT_DEFAULT_COLLECTION_NAME    = 'groupContent',
	  GROUP_ATTRIBUTES_DEFAULT_COLLECTION_NAME = "groupAttribute";

var exportsDaos;

if (dbEngine === DataSourceHandler.MONGOOSE) {

	exportsDaos = {
		partyDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, PARTY_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), PartyMongooseSchema), PartyDaoMongooseImpl),
		staffDao              : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, STAFF_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), StaffDataMongooseDbSchema), StaffDao),
		accountDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, ACCOUNT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), AccountMongooseDbSchema), AccountDaoMongooseImpl),
		authContextDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, AUTHCONTEXT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), AuthContextMongooseDbSchema), AuthContextDaoMongooseImpl),
		roleDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, ROLE_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), RoleMongooseDbSchema), RoleDaoMongooseImpl),
		groupDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, GROUP_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), GroupMongooseSchema), GroupDao),
		groupContentDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, GROUP_CONTENT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), GroupContentMongooseSchema), GroupContentDao),
		groupAttributeValueDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, GROUP_ATTRIBUTES_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), GroupAttributeValueMongooseSchema), GroupAttributeValueDao)
	};

} else if (dbEngine === DataSourceHandler.LOKIJS) {
	exportsDaos = {
		partyDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathLoki, PARTY_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), PartyDaoLokiJsImpl),
		staffDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathLoki, STAFF_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), StaffDao),
		accountDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathLoki, ACCOUNT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), AccountDaoLokiJsImpl),
		authContextDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathLoki, AUTHCONTEXT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), AuthContextDaoLokiJsImpl),
		roleDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathLoki, ROLE_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), RoleDaoLokiJsImpl),
		groupDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathLoki, GROUP_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), GroupDao),
		groupContentDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathLoki, GROUP_CONTENT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), GroupContentDao),
		groupAttributeValueDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathLoki, GROUP_ATTRIBUTES_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), GroupAttributeValueDao)
	}
}

module.exports = exportsDaos;

// When creating a dao also creates a db connection to the database.
// In case you want the program do not open unnecessary connections, comment the daos
// you don't need and make sure the commented daos are not referenced in the config settings.
//module.exports = {
//	accountDaoLokijs: DaoFactory.createAccountDao(DataSourceHandler.LOKIJS, config.db.lokiJsDBPath),
//	partyDaoLokijs: DaoFactory.createPartyDao(DataSourceHandler.LOKIJS, config.db.lokiJsDBPath),
//	// accountDaoMongo: DaoFactory.createAccountDao(DataSourceHandler.MONGOOSE, config.db.mongoConnUrl),
//	// partyDaoMongo: DaoFactory.createPartyDao(DataSourceHandler.MONGOOSE, config.db.mongoConnUrl),
//	authContextDaoLokijs: DaoFactory.createAuthContextDao(DataSourceHandler.LOKIJS, config.db.lokiJsDBPath),
//	roleDaoLokijs: DaoFactory.createRoleDao(DataSourceHandler.LOKIJS, config.db.lokiJsDBPath),
//	groupContentDaoLokijs: DaoFactory.createGroupContentDao(DataSourceHandler.LOKIJS, config.db.lokiJsDBPath),
//	groupDaoLokijs: DaoFactory.createGroupDao(DataSourceHandler.LOKIJS, config.db.lokiJsDBPath),
//	groupAttributeValueDaoLokijs: DaoFactory.createGroupAttributesDao(DataSourceHandler.LOKIJS, config.db.lokiJsDBPath)
//};