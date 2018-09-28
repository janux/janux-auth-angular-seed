const argv = require('yargs').argv;
const moment = require('moment');
const _ = require('lodash');
const fs = require('fs');
const shell = require('shelljs');

// Command arguments.
const backupFileArg = 'backup-file';
const configFileArg = 'config-file';

// Config file arguments.
const hostJSONArg = 'host';
const usernameJSONArg = 'username';
const postCommandJSONArg = 'post-command';
const sshKeyJSONArg = 'ssh-key';
const sshPortJSONArg = 'ssh-port';
const pathJSONArg = 'path';

module.exports = function (gulp) {

	var username;
	var host;
	var path;
	var sshKeyPath;
	var postCommand;
	var sshDefaultPort = 22;
	var sshPort;
	var backupFilePath;
	var tempDirectory;
	var configFile;

	/**
	 * Validate arguments
	 * @return {boolean}
	 */
	function validateArguments() {
		var isValid = true;
		if (_.isNil(host) || !_.isString(host) || host.trim() === '') {
			console.error("No " + hostJSONArg + " defined ... aborting");
			isValid = false;
		}
		if (_.isNil(path) || !_.isString(path) || path.trim() === '') {
			console.error("No " + pathJSONArg + " defined ... aborting");
			isValid = false;
		}
		if (_.isNil(username) || !_.isString(username) || username.trim() === '') {
			console.error("No " + usernameJSONArg + " defined ... aborting");
			isValid = false;
		}

		if (_.isNil(sshKeyPath) || !_.isString(sshKeyPath) || sshKeyPath.trim() === '') {
			console.error("No " + sshKeyJSONArg + " defined ... aborting");
			isValid = false;
		}
		if (_.isNil(backupFilePath) || !_.isString(backupFilePath) || backupFilePath.trim() === '') {
			console.error("No " + backupFileArg + " defined ... aborting");
			isValid = false;
		} else {
			//Validate if the files does exists.
			if (fs.existsSync(backupFilePath) === false || fs.lstatSync(backupFilePath).isFile() === false) {
				console.error(argv[backupFileArg] + " is not a file ... aborting");
				isValid = false;
			}
		}
		if (_.isNumber(sshPort) === false) {
			console.log("Using default port " + sshDefaultPort);
			sshPort = sshDefaultPort;
		} else {
			console.log("Using port " + sshPort);
		}

		return isValid;
	}

	gulp.task('extractFile', ['validateArgsAndSystemRollBack'], function (cb) {
		const time = moment().format("YYYY-MM-DD-HH-mm");

		tempDirectory = "/tmp/" + time + "/";
		const commandMkDir = "mkdir -p " + tempDirectory;
		// console.log("commandMkDir:" + commandMkDir);
		const commandExtract = 'tar -xvzf ' + backupFilePath + " -C " + tempDirectory;
		console.log("commandExtract:" + commandExtract);

		function commandMkDirExecuted(code, stdout, stderr) {
			if (code === 0) {
				executeCommandExtract();
			} else {
				console.error("Error running mkdir \n" + stdout + "\n" + stderr);
				cb(stdout);
			}
		}

		function executeCommandExtract() {
			shell.exec(commandExtract, function (code, stdout, stderr) {
				if (code === 0) {
					cb();
				} else {
					console.error("Error running mkdir \n" + stdout + "\n" + stderr);
					cb(stdout);
				}
			})
		}

		shell.exec(commandMkDir, commandMkDirExecuted);
	});

	gulp.task('rollback', ['extractFile'], function (cb) {
		var rsyncCommand;
		rsyncCommand = 'rsync -az -e "ssh  -p ' + sshPort + ' -i ' + sshKeyPath + '  -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" ' + tempDirectory + ' ' + username + '@' + host + ':' + path + ' --delete';
		shell.exec(rsyncCommand, function (code, stdout, stderr) {
			if (code === 0) {
				console.log("Rsync executed successfully");
				executePostCommand();
			} else {
				console.error("Error running rsync \n" + stdout + "\n" + stderr);
				cb(stdout);
			}
		});

		function executePostCommand() {

			if (_.isString(postCommand)) {
				const postRemoteCommand = "ssh -p" + sshPort + ' ' + username + "@" + host + " -i " + sshKeyPath + " '" + postCommand + "'";
				shell.exec(postRemoteCommand, function (code, stdout, stderr) {
					if (code === 0) {
						console.log("Post command executed successful");
						cb()
					} else {
						console.error("Error running rsync \n" + stdout + "\n" + stderr);
						cb(stdout);
					}
				});
			} else {
				console.log("Ending deploy....");
				cb();
			}
		}

	});

	gulp.task('validateArgsAndSystemRollBack', function (cb) {
		configFile = argv[configFileArg];
		backupFilePath = argv[backupFileArg];
		if (!_.isString(configFile)) {
			return cb(configFileArg + "is not a valid argument");
		}

		if (fs.existsSync(configFile) === false || fs.lstatSync(configFile).isFile() === false) {
			return cb(configFile + "is not a valid file");
		}

		fs.readFile(configFile, 'utf8', function (err, data) {
			if (err) cb("Error reading file");
			var obj = JSON.parse(data);
			host = obj[hostJSONArg];
			path = obj[pathJSONArg];
			sshKeyPath = obj[sshKeyJSONArg];
			postCommand = obj[postCommandJSONArg];
			sshPort = obj[sshPortJSONArg];
			username = obj[usernameJSONArg];


			console.log("Deploy given the arguments " +
				"\nhost: " + host +
				"\npath: " + path +
				"\nssh key: " + sshKeyPath +
				"\nssh port: " + sshPort +
				"\nbackup file: " + backupFilePath +
				"\npost command: " + (postCommand ? postCommand : 'NO COMMAND DEFINED')
			);

			const isValid = validateArguments();
			if (isValid === false) {
				cb("Error in arguments");
			} else {
				cb();
			}
		});


	});

};
