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
      RoleDaoLokiJsImpl          = require('janux-persist').RoleDaoLokiJsImpl,
      AccountInvDaoLokiJsImpl    = require('janux-persist').AccountInvitationDaoLokiJsImpl,
      AccountInvDaoMongooseImpl  = require('janux-persist').AccountInvitationDaoMongooseImpl;


const PartyMongooseSchema               = require('janux-persist').PartyMongooseSchema,
      StaffDataMongooseDbSchema         = require('janux-persist').StaffDataMongooseDbSchema,
      AccountMongooseDbSchema           = require('janux-persist').AccountMongooseDbSchema,
      AccountInvMongooseDbSchema        = require('janux-persist').AccountInvitationMongooseDbSchema,
      AuthContextMongooseDbSchema       = require('janux-persist').AuthContextMongooseDbSchema,
      RoleMongooseDbSchema              = require('janux-persist').RoleMongooseDbSchema,
      GroupMongooseSchema               = require('janux-persist').GroupMongooseSchema,
      GroupContentMongooseSchema        = require('janux-persist').GroupContentMongooseSchema,
      GroupAttributeValueMongooseSchema = require('janux-persist').GroupAttributeValueMongooseSchema;

const PARTY_DEFAULT_COLLECTION_NAME            = 'contact',
      STAFF_COLLECTION_NAME                    = 'staff',
      ACCOUNT_DEFAULT_COLLECTION_NAME          = 'account',
      ACCOUNT_INV_DEFAULT_COLLECTION_NAME      = 'accountInvitation',
      AUTHCONTEXT_DEFAULT_COLLECTION_NAME      = 'authcontext',
      ROLE_DEFAULT_COLLECTION_NAME             = 'role',
      GROUP_DEFAULT_COLLECTION_NAME            = 'group',
      GROUP_CONTENT_DEFAULT_COLLECTION_NAME    = 'groupContent',
      GROUP_ATTRIBUTES_DEFAULT_COLLECTION_NAME = "groupAttribute";


// Begin Glarus services DAOs.

const VehicleDao             = require("glarus-services").VehicleDao,
      TaskRelationDao        = require("glarus-services").TaskRelationDao,
      TimeRecordPrincipalDao = require("glarus-services").TimeRecordPrincipalDao,
      OperationDao           = require("glarus-services").OperationDao,
      OperationAttributeDao  = require("glarus-services").OperationAttributeDao,
      OperationPrincipalDao  = require("glarus-services").OperationPrincipalDao,
      TimeRecordDao          = require("glarus-services").TimeRecordDao,
      ResourceDao            = require("glarus-services").ResourceDao,
      CurrentResourceDao     = require("glarus-services").OperationResourceDao,
      TimeRecordAttributeDao = require("glarus-services").TimeRecordAttributeDao,
      TimeRecordResourceDao  = require("glarus-services").TimeRecordResourceDao,
      TaskTypeDao            = require('glarus-services').TaskTypeDao,
      RateDao                = require('glarus-services').RateDao,
      RateMatrixDao          = require('glarus-services').RateMatrixDao,
      InvoiceDao             = require('glarus-services').InvoiceDao,
      InvoiceItemDao         = require('glarus-services').InvoiceItemDao,
      ExpenseDao             = require('glarus-services').ExpenseDao,
      InvoiceItemTEDao       = require('glarus-services').InvoiceItemTEDao,
      InvoiceOperationDao    = require('glarus-services').InvoiceOperationDao;


const VehicleMongooseSchema             = require("glarus-services").VehicleMongooseSchema,
      TaskRelationMongooseSchema        = require("glarus-services").TaskRelationMongooseSchema,
      TimeRecordPrincipalMongooseSchema = require("glarus-services").TimeRecordPrincipalMongooseSchema,
      TimeRecordMongooseSchema          = require("glarus-services").TimeRecordMongooseSchema,
      OperationMongooseSchema           = require("glarus-services").OperationMongooseSchema,
      OperationAttributeMongooseSchema  = require("glarus-services").OperationAttributeMongooseSchema,
      OperationPrincipalMongooseSchema  = require("glarus-services").OperationPrincipalMongooseSchema,
      ResourceMongooseSchema            = require("glarus-services").ResourceMongooseSchema,
      CurrentResourceMongooseSchema     = require("glarus-services").OperationResourceMongooseSchema,
      TimeRecordAttributeMongooseSchema = require("glarus-services").TimeRecordAttributeMongooseSchema,
      TimeRecordResourceMongooseSchema  = require("glarus-services").TimeRecordResourceMongooseSchema,
      TaskTypeMongooseSchema            = require('glarus-services').TaskTypeMongooseSchema,
      RateMongooseSchema                = require('glarus-services').RateMongooseSchema,
      RateMatrixMongooseSchema          = require('glarus-services').RateMatrixMongooseSchema,
      InvoiceMongooseSchema             = require('glarus-services').InvoiceMongooseSchema,
      InvoiceOperationMongooseSchema    = require('glarus-services').InvoiceOperationMongooseSchema,
      InvoiceItemMongooseSchema         = require('glarus-services').InvoiceItemMongooseSchema,
      ExpenseMongooseSchema             = require('glarus-services').ExpenseMongooseSchema,
      InvoiceItemTEMongooseSchema       = require('glarus-services').InvoiceItemTEMongooseSchema;

const VEHICLE_COLLECTION                 = "vehicle",
      TASK_RELATION_COLLECTION           = "taskRelation",
      TIME_RECORD_COLLECTION             = "timeRecord",
      TIME_RECORD_PRINCIPAL_COLLECTION   = "timeRecordPrincipal",
      OPERATION_COLLECTION               = "operation",
      OPERATION_ATTRIBUTE_COLLECTION     = "operationAttribute",
      OPERATION_PRINCIPAL_COLLECTION     = "operationPrincipal",
      RESOURCE_COLLECTION                = "resource",
      TIME_RECORD_ATTRIBUTE_COLLECTION   = "timeRecordAttribute",
      CURRENT_RESOURCE_COLLECTION        = "currentResource",
      TIME_RECORD_RESOURCE_COLLECTION    = "timeRecordResource",
      TASK_TYPE_COLLECTION               = 'taskType',
      RATE_COLLECTION                    = 'rate',
      RATE_MATRIX_COLLECTION             = 'rateMatrix',
      INVOICE_COLLECTION                 = 'invoice',
      INVOICE_OPERATION_COLLECTION       = 'invoiceOperation',
      INVOICE_ITEM_COLLECTION            = 'invoiceItem',
      EXPENSE_COLLECTION                 = 'expense',
      INVOICE_ITEM_TIME_ENTRY_COLLECTION = 'invoiceItemTimeEntry';

// End Glarus services DAOs.

var exportsDaos;

if (dbEngine === DataSourceHandler.MONGOOSE) {

	exportsDaos = {
		partyDao              : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, PARTY_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), PartyMongooseSchema), PartyDaoMongooseImpl),
		staffDao              : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, STAFF_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), StaffDataMongooseDbSchema), StaffDao),
		accountDao            : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, ACCOUNT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), AccountMongooseDbSchema), AccountDaoMongooseImpl),
		accountInvDao         : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, ACCOUNT_INV_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), AccountInvMongooseDbSchema), AccountInvDaoMongooseImpl),
		authContextDao        : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, AUTHCONTEXT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), AuthContextMongooseDbSchema), AuthContextDaoMongooseImpl),
		roleDao               : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, ROLE_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), RoleMongooseDbSchema), RoleDaoMongooseImpl),
		groupDao              : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, GROUP_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), GroupMongooseSchema), GroupDao),
		groupContentDao       : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, GROUP_CONTENT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), GroupContentMongooseSchema), GroupContentDao),
		groupAttributeValueDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, GROUP_ATTRIBUTES_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), GroupAttributeValueMongooseSchema), GroupAttributeValueDao),

		vehicleDao            : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, VEHICLE_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), VehicleMongooseSchema), VehicleDao),
		taskRelationDao       : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, TASK_RELATION_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), TaskRelationMongooseSchema), TaskRelationDao),
		timeRecordPrincipalDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, TIME_RECORD_PRINCIPAL_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), TimeRecordPrincipalMongooseSchema), TimeRecordPrincipalDao),
		operationDao          : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, OPERATION_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), OperationMongooseSchema), OperationDao),
		operationAttributeDao : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, OPERATION_ATTRIBUTE_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), OperationAttributeMongooseSchema), OperationAttributeDao),
		operationPrincipalDao : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, OPERATION_PRINCIPAL_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), OperationPrincipalMongooseSchema), OperationPrincipalDao),
		timeRecordDao         : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, TIME_RECORD_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), TimeRecordMongooseSchema), TimeRecordDao),
		resourceDao           : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, RESOURCE_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), ResourceMongooseSchema), ResourceDao),
		currentResourceDao    : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, CURRENT_RESOURCE_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), CurrentResourceMongooseSchema), CurrentResourceDao),
		timeRecordAttributeDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, TIME_RECORD_ATTRIBUTE_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), TimeRecordAttributeMongooseSchema), TimeRecordAttributeDao),
		timeRecordResourceDao : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, TIME_RECORD_RESOURCE_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), TimeRecordResourceMongooseSchema), TimeRecordResourceDao),
		taskTypeDao           : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, TASK_TYPE_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), TaskTypeMongooseSchema), TaskTypeDao),
		rateDao               : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, RATE_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), RateMongooseSchema), RateDao),
		rateMatrixDao         : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, RATE_MATRIX_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), RateMatrixMongooseSchema), RateMatrixDao),
		invoiceDao            : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, INVOICE_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), InvoiceMongooseSchema), InvoiceDao),
		invoiceOperationDao   : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, INVOICE_OPERATION_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), InvoiceOperationMongooseSchema), InvoiceOperationDao),
		invoiceItemDao        : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, INVOICE_ITEM_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), InvoiceItemMongooseSchema), InvoiceItemDao),
		expenseDao            : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, EXPENSE_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), ExpenseMongooseSchema), ExpenseDao),
		invoiceItemTE         : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, INVOICE_ITEM_TIME_ENTRY_COLLECTION, EntityPropertiesImpl.createDefaultProperties(), InvoiceItemTEMongooseSchema), InvoiceItemTEDao),
		commDataSource        : {dbEngine: dbEngine, dbPath: pathMongo}
	};

} else if (dbEngine === DataSourceHandler.LOKIJS) {
	exportsDaos = {
		partyDao              : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathLoki, PARTY_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), PartyDaoLokiJsImpl),
		staffDao              : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathLoki, STAFF_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), StaffDao),
		accountDao            : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathLoki, ACCOUNT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), AccountDaoLokiJsImpl),
		accountInvDao         : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathLoki, ACCOUNT_INV_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), AccountInvDaoLokiJsImpl),
		authContextDao        : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathLoki, AUTHCONTEXT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), AuthContextDaoLokiJsImpl),
		roleDao               : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathLoki, ROLE_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), RoleDaoLokiJsImpl),
		groupDao              : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathLoki, GROUP_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), GroupDao),
		groupContentDao       : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathLoki, GROUP_CONTENT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), GroupContentDao),
		groupAttributeValueDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathLoki, GROUP_ATTRIBUTES_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), GroupAttributeValueDao),

		vehicleDao            : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, VEHICLE_COLLECTION, EntityPropertiesImpl.createDefaultProperties()), VehicleDao),
		taskRelationDao       : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, TASK_RELATION_COLLECTION, EntityPropertiesImpl.createDefaultProperties()), TaskRelationDao),
		timeRecordPrincipalDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, TIME_RECORD_PRINCIPAL_COLLECTION, EntityPropertiesImpl.createDefaultProperties()), TimeRecordPrincipalDao),
		operationDao          : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, OPERATION_COLLECTION, EntityPropertiesImpl.createDefaultProperties()), OperationDao),
		operationAttributeDao : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, OPERATION_ATTRIBUTE_COLLECTION, EntityPropertiesImpl.createDefaultProperties()), OperationAttributeDao),
		operationPrincipalDao : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, OPERATION_PRINCIPAL_COLLECTION, EntityPropertiesImpl.createDefaultProperties()), OperationPrincipalDao),
		timeRecordDao         : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, TIME_RECORD_COLLECTION, EntityPropertiesImpl.createDefaultProperties()), TimeRecordDao),
		resourceDao           : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, RESOURCE_COLLECTION, EntityPropertiesImpl.createDefaultProperties()), ResourceDao),
		currentResourceDao    : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, CURRENT_RESOURCE_COLLECTION, EntityPropertiesImpl.createDefaultProperties()), CurrentResourceDao),
		timeRecordAttributeDao: DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, TIME_RECORD_ATTRIBUTE_COLLECTION, EntityPropertiesImpl.createDefaultProperties()), TimeRecordAttributeDao),
		timeRecordResourceDao : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, TIME_RECORD_RESOURCE_COLLECTION, EntityPropertiesImpl.createDefaultProperties()), TimeRecordResourceDao),
		taskTypeDao           : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, TASK_TYPE_COLLECTION, EntityPropertiesImpl.createDefaultProperties()), TaskTypeDao),
		rateDao               : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, RATE_COLLECTION, EntityPropertiesImpl.createDefaultProperties()), RateDao),
		rateMatrixDao         : DaoFactory.subscribeDao(new DaoSettings(dbEngine, pathMongo, RATE_MATRIX_COLLECTION, EntityPropertiesImpl.createDefaultProperties()), RateMatrixDao)
	}
}

module.exports = exportsDaos;
