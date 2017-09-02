"use strict";

var Promise = require("bluebird");
var md5 = require("md5");
var log = require('log4js');

var partyValidator = require('janux-persist').PartyValidator;
var daoFactory = require('janux-persist').DaoFactory;
var usrService = require('janux-persist').UserService;
var userGenerator = require("./users-generator");

var UserGenerator = (function () {
    
    function UserGenerator() {}
    
    UserGenerator.generateUserDateInTheDatabase = function (dbEngine, path) {
        this._log.debug("Call to generateUserDateInTheDatabase");
        var partyDao;
        var accountDao;
        partyDao = daoFactory.createPartyDao(dbEngine, path);
        accountDao = daoFactory.createAccountDao(dbEngine, path);
        var userService = usrService.createInstance(accountDao, partyDao);
        var usersToInsert = this.generateUserFakeData();
        return Promise.map(usersToInsert, function (element) {
            return userService.insert(element);
        })
            .then(function (insertedUsers) {
            return Promise.resolve(insertedUsers);
        });
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