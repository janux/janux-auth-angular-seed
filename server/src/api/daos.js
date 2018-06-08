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


// Begin Glarus services DAOs.

const VehicleDao            = require("glarus-services").VehicleDao,
      TimeEntryPrincipalDao = require("glarus-services").TimeEntryPrincipalDao,
      OperationDao          = require("glarus-services").OperationDao,
      OperationAttributeDao = require("glarus-services").OperationAttributeDao,
      OperationPrincipalDao = require("glarus-services").OperationPrincipalDao,
      TimeEntryDao          = require("glarus-services").TimeEntryDao,
      ResourceDao           = require("glarus-services").ResourceDao,
      CurrentResourceDao    = require("glarus-services").CurrentResourceDao,
      TimeEntryAttributeDao = require("glarus-services").TimeEntryAttributeDao,
      TimeEntryResourceDao  = require("glarus-services").TimeEntryResourceDao,
      TaskTypeDao           = require('glarus-services').TaskTypeDao,
      RateDao               = require('glarus-services').RateDao,
      RateMatrixDao         = require('glarus-services').RateMatrixDao;


const VehicleMongooseSchema            = require("glarus-services").VehicleMongooseSchema,
      TimeEntryPrincipalMongooseSchema = require("glarus-services").TimeEntryPrincipalMongooseSchema,
      TimeEntryMongooseSchema          = require("glarus-services").TimeEntryMongooseSchema,
      OperationMongooseSchema          = require("glarus-services").OperationMongooseSchema,
      OperationAttributeMongooseSchema = require("glarus-services").OperationAttributeMongooseSchema,
      OperationPrincipalMongooseSchema = require("glarus-services").OperationPrincipalMongooseSchema,
      ResourceMongooseSchema           = require("glarus-services").ResourceMongooseSchema,
      CurrentResourceMongooseSchema    = require("glarus-services").CurrentResourceMongooseSchema,
      TimeEntryAttributeMongooseSchema = require("glarus-services").TimeEntryAttributeMongooseSchema,
      TimeEntryResourceMongooseSchema  = require("glarus-services").TimeEntryResourceMongooseSchema,
      TaskTypeMongooseSchema           = require('glarus-services').TaskTypeMongooseSchema,
      RateMongooseSchema               = require('glarus-services').RateMongooseSchema,
      RateMatrixMongooseSchema         = require('glarus-services').RateMAtrixMongooseSchema;

const VEHICLE_COLLECTION              = "vehicle",
      TIME_ENTRY_COLLECTION           = "timeEntry",
      TIME_ENTRY_PRINCIPAL_COLLECTION = "timeEntryPrincipal",
      OPERATION_COLLECTION            = "operation",
      OPERATION_ATTRIBUTE_COLLECTION  = "operationAttribute",
      OPERATION_PRINCIPAL_COLLECTION  = "operationPrincipal",
      RESOURCE_COLLECTION             = "resource",
      TIME_ENTRY_ATTRIBUTE_COLLECTION = "timeEntryAttribute",
      CURRENT_RESOURCE_COLLECTION     = "currentResource",
      TIME_ENTRY_RESOURCE_COLLECTION  = "timeEntryResource",
      TASK_TYPE_COLLECTION            = 'taskType',
      RATE_COLLECTION                 = 'rate',
      RATE_MATRIX_COLLECTION          = 'rateMatrix';

// End Glarus services DAOs.

var exportsDaos;

if (dbEngine === DataSourceHandler.MONGOOSE) {

	exportsDaos = {
		partyDao              : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, PARTY_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), PartyMongooseSchema), PartyDaoMongooseImpl),
		staffDao              : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, STAFF_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), StaffDataMongooseDbSchema), StaffDao),
		accountDao            : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, ACCOUNT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), AccountMongooseDbSchema), AccountDaoMongooseImpl),
		authContextDao        : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, AUTHCONTEXT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), AuthContextMongooseDbSchema), AuthContextDaoMongooseImpl),
		roleDao               : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, ROLE_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), RoleMongooseDbSchema), RoleDaoMongooseImpl),
		groupDao              : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, GROUP_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), GroupMongooseSchema), GroupDao),
		groupContentDao       : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, GROUP_CONTENT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), GroupContentMongooseSchema), GroupContentDao),
		groupAttributeValueDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, GROUP_ATTRIBUTES_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), GroupAttributeValueMongooseSchema), GroupAttributeValueDao),

		vehicleDao           : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, VEHICLE_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), VehicleMongooseSchema), VehicleDao),
		timeEntryPrincipalDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, TIME_ENTRY_PRINCIPAL_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), TimeEntryPrincipalMongooseSchema), TimeEntryPrincipalDao),
		operationDao         : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, OPERATION_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), OperationMongooseSchema), OperationDao),
		operationAttributeDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, OPERATION_ATTRIBUTE_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), OperationAttributeMongooseSchema), OperationAttributeDao),
		operationPrincipalDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, OPERATION_PRINCIPAL_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), OperationPrincipalMongooseSchema), OperationPrincipalDao),
		timeEntryDao         : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, TIME_ENTRY_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), TimeEntryMongooseSchema), TimeEntryDao),
		resourceDao          : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, RESOURCE_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), ResourceMongooseSchema), ResourceDao),
		currentResourceDao   : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, CURRENT_RESOURCE_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), CurrentResourceMongooseSchema), CurrentResourceDao),
		timeEntryAttributeDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, TIME_ENTRY_ATTRIBUTE_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), TimeEntryAttributeMongooseSchema), TimeEntryAttributeDao),
		timeEntryResourceDao : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, TIME_ENTRY_RESOURCE_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), TimeEntryResourceMongooseSchema), TimeEntryResourceDao),
		taskTypeDao          : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, TASK_TYPE_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), TaskTypeMongooseSchema), TaskTypeDao),
		rateDao              : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, RATE_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), RateMongooseSchema), RateDao),
		rateMatrixDao        : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, RATE_MATRIX_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), RateMatrixMongooseSchema), RateMatrixDao)
	};

} else if (dbEngine === DataSourceHandler.LOKIJS) {
	exportsDaos = {
		partyDao              : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathLoki, PARTY_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), PartyDaoLokiJsImpl),
		staffDao              : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathLoki, STAFF_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), StaffDao),
		accountDao            : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathLoki, ACCOUNT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), AccountDaoLokiJsImpl),
		authContextDao        : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathLoki, AUTHCONTEXT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), AuthContextDaoLokiJsImpl),
		roleDao               : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathLoki, ROLE_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), RoleDaoLokiJsImpl),
		groupDao              : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathLoki, GROUP_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), GroupDao),
		groupContentDao       : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathLoki, GROUP_CONTENT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), GroupContentDao),
		groupAttributeValueDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathLoki, GROUP_ATTRIBUTES_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), GroupAttributeValueDao),

		vehicleDao           : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, VEHICLE_COLLECTION, EntityPropertiesImpl.createDefaultProperties()), VehicleDao),
		timeEntryPrincipalDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, TIME_ENTRY_PRINCIPAL_COLLECTION, EntityPropertiesImpl.createDefaultProperties()), TimeEntryPrincipalDao),
		operationDao         : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, OPERATION_COLLECTION, EntityPropertiesImpl.createDefaultProperties()), OperationDao),
		operationAttributeDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, OPERATION_ATTRIBUTE_COLLECTION, EntityPropertiesImpl.createDefaultProperties()), OperationAttributeDao),
		operationPrincipalDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, OPERATION_PRINCIPAL_COLLECTION, EntityPropertiesImpl.createDefaultProperties()), OperationPrincipalDao),
		timeEntryDao         : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, TIME_ENTRY_COLLECTION, EntityPropertiesImpl.createDefaultProperties()), TimeEntryDao),
		resourceDao          : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, RESOURCE_COLLECTION, EntityPropertiesImpl.createDefaultProperties()), ResourceDao),
		currentResourceDao   : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, CURRENT_RESOURCE_COLLECTION, EntityPropertiesImpl.createDefaultProperties()), CurrentResourceDao),
		timeEntryAttributeDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, TIME_ENTRY_ATTRIBUTE_COLLECTION, EntityPropertiesImpl.createDefaultProperties()), TimeEntryAttributeDao),
		timeEntryResourceDao : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, TIME_ENTRY_RESOURCE_COLLECTION, EntityPropertiesImpl.createDefaultProperties()), TimeEntryResourceDao),
		taskTypeDao          : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, TASK_TYPE_COLLECTION, EntityPropertiesImpl.createDefaultProperties()), TaskTypeDao),
		rateDao              : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, RATE_COLLECTION, EntityPropertiesImpl.createDefaultProperties()), RateDao),
		rateMatrixDao        : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, RATE_MATRIX_COLLECTION, EntityPropertiesImpl.createDefaultProperties()), RateMatrixDao)
	}
}

module.exports = exportsDaos;