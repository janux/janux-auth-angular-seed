"use strict";

var Promise = require("bluebird");
var md5 = require("md5");
var log = require('log4js');

var partyValidator = require('janux-persist').PartyValidator;
var EntityPropertiesImpl = require('janux-persist').EntityPropertiesImpl;
var DataSourceHandler = require('janux-persist').DataSourceHandler;
var DaoSettings = require('janux-persist').DaoSettings;
var PartyMongooseSchema = require('janux-persist').PartyMongooseSchema;
var AccountMongooseDbSchema = require('janux-persist').AccountMongooseDbSchema;
var PartyDaoMongooseImpl = require('janux-persist').PartyDaoMongooseImpl;
var AccountDaoMongooseImpl = require('janux-persist').AccountDaoMongooseImpl;
var PartyDaoLokiJsImpl = require('janux-persist').PartyDaoLokiJsImpl;
var AccountDaoLokiJsImpl = require('janux-persist').AccountDaoLokiJsImpl;
var daoFactory = require('janux-persist').DaoFactory;
var usrService = require('janux-persist').UserService;
var userGenerator = require("./users-generator");

const PARTY_DEFAULT_COLLECTION_NAME            = 'contact',
	  ACCOUNT_DEFAULT_COLLECTION_NAME          = 'account';

var UserGenerator = (function () {

    function UserGenerator() {}

    UserGenerator.generateUserDateInTheDatabase = function (dbEngine, path) {
        this._log.debug("Call to generateUserDateInTheDatabase");
        var partyDao;
        var accountDao;
		if (dbEngine === DataSourceHandler.MONGOOSE) {
			partyDao = daoFactory.subscribeDao(new DaoSettings(dbEngine, path, PARTY_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), PartyMongooseSchema), PartyDaoMongooseImpl);
			accountDao = daoFactory.subscribeDao(new DaoSettings(dbEngine, path, ACCOUNT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties(), AccountMongooseDbSchema), AccountDaoMongooseImpl);
		} else if (dbEngine === DataSourceHandler.LOKIJS) {
			partyDao = daoFactory.subscribeDao(new DaoSettings(dbEngine, path, PARTY_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), PartyDaoLokiJsImpl);
			accountDao = daoFactory.subscribeDao(new DaoSettings(dbEngine, path, ACCOUNT_DEFAULT_COLLECTION_NAME, EntityPropertiesImpl.createDefaultProperties()), AccountDaoLokiJsImpl);
		}

        // partyDao = daoFactory.createPartyDao(dbEngine, path);
        // accountDao = daoFactory.createAccountDao(dbEngine, path);
        var userService = usrService.createInstance(accountDao, partyDao);
        var usersToInsert = this.generateUserFakeData();

		var inserted = new Promise(function(resolve) {
			// Wait for lokijs to initialize
			setTimeout(function() {
				var insertedUsers = Promise.map(usersToInsert, function (element) {
						return userService.insert(element);
					})
					.then(function (insertedUsers) {
						return Promise.resolve(insertedUsers);
					});
				resolve(insertedUsers);
			},10);
		});

		return inserted;
    };

    UserGenerator.generateUserFakeData = function () {
        this._log.debug("Call to generateUserFakeData");
        var UsersGenerator = userGenerator.UsersGenerator;
        var usersGen = new UsersGenerator();
        var fakeUsers = usersGen.generateUsers(3);
        var users = [
            {
                username: 'widget',
                password: md5('test1'),
                roles: ["WIDGET_DESIGNER"]
            },
            {
                username: 'manager',
                password: md5('test2'),
                roles: ["MANAGER"]
            },
            {
                username: 'admin',
                password: md5('1234567'),
                roles: ["ADMIN"]
            }
        ];
        users.forEach(function (user, iUser) {
            users[iUser] = usersGen.generateUser(user);
        });
        users = users.concat(fakeUsers);
        for (var _i = 0, users_1 = users; _i < users_1.length; _i++) {
            var user = users_1[_i];
            user.contact.typeName = partyValidator.PERSON;
        }
        this._log.debug("Returning %j", users);
        return users;
    };

    UserGenerator._log = log.getLogger('UserGenerator');

    return UserGenerator;
}());

exports.UserGenerator = UserGenerator;