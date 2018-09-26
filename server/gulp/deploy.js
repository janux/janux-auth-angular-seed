'use strict';

var argv = require('yargs').argv;
var moment = require('moment');
var GulpSSH = require('gulp-ssh');
var _ = require('lodash');
var fs = require('fs');
var shell = require('shelljs');

const hostArg = 'host';
const usernameArg = 'username';
const pathArg = 'path';
const backupPathArg = 'backup-path';
const postCommandArg = 'post-command';
const sshKeyArg = 'ssh-key';
const sshPortArg = 'ssh-port';
const passwordArg = 'password';

module.exports = function (gulp) {
	var username;
	var host;
	var path;
	var sshKeyPath;
	var backupPath;
	var postCommand;
	var sshDefaultPort = 22;
	var sshPort;
	var compressedFileName;
	var password;
	var cfg = gulp.cfg;

	/**
	 * Validate arguments
	 * @return {boolean}
	 */
	function validateArguments() {
		var isValid = true;
		if (_.isNil(host) || !_.isString(host) || host.trim() === '') {
			console.error("No " + hostArg + " defined ... aborting");
			isValid = false;
		}
		if (_.isNil(path) || !_.isString(path) || path.trim() === '') {
			console.error("No " + pathArg + " defined ... aborting");
			isValid = false;
		}
		if (_.isNil(username) || !_.isString(username) || username.trim() === '') {
			console.error("No " + usernameArg + " defined ... aborting");
			isValid = false;
		}

		if (_.isString(password) && password.trim() !== '') {
			console.log("Using password as auth mechanism")
		} else {
			console.log("Using ssh private key as auth mechanism");
			if (_.isNil(sshKeyPath) || !_.isString(sshKeyPath) || sshKeyPath.trim() === '') {
				console.error("No " + sshKeyArg + " defined ... aborting");
				isValid = false;
			}
		}

		// If there is a backup path. Validate is there is directory
		// and the task has write permission.
		if (_.isString(backupPath)) {
			if (fs.existsSync(backupPath) === false || fs.lstatSync(backupPath).isDirectory() === false) {
				console.error(argv[backupPathArg] + " is not a directory ... aborting");
				isValid = false;
			} else if (validateWritePermissionPath(backupPath) === false) {
				console.error("This task does not have write permissions to path " + backupPath + "... aborting");
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

	/**
	 * Validate if the process has write permissions given the path.
	 * @param path
	 * @return {boolean}
	 */
	function validateWritePermissionPath(path) {
		try {
			fs.accessSync(path, fs.R_OK | fs.W_OK);
			return true;
		} catch (e) {
			return false;
		}
	}

	function createSshGulp() {
		var config;
		if (_.isString(password)) {
			config = {
				host    : host,
				port    : sshPort,
				password: password,
				username: username
			};
		} else {
			config = {
				host      : host,
				port      : sshPort,
				privateKey: fs.readFileSync(sshKeyPath),
				username  : username
			};
		}
		var gulpSsh = new GulpSSH({
			ignoreErrors: false,
			sshConfig   : config
		});
		return gulpSsh;
	}

	gulp.task('validateArgs', function (cb) {
		host = argv[hostArg];
		path = argv[pathArg];
		sshKeyPath = argv[sshKeyArg];
		backupPath = argv[backupPathArg];
		postCommand = argv[postCommandArg];
		sshPort = argv[sshPortArg];
		username = argv[usernameArg];
		password = argv[passwordArg];

		console.log("Deploy given the arguments " +
			"\nhost: " + host +
			"\npath: " + path +
			"\nssh key: " + sshKeyPath +
			"\nssh port: " + sshPort +
			"\nbackup path: " + (backupPath ? backupPath : 'NO BACKUP PATH DEFINED NOT PERFORMING BACKUP') +
			"\npost command: " + (postCommand ? postCommand : 'NO COMMAND DEFINED')
		);

		var isValid = validateArguments();
		if (isValid === false) {
			return cb("Error in arguments");
		} else {
			return cb();
		}
	});

	/**
	 * Compress the remote path and put in in a file.
	 */
	gulp.task('compressCurrentProject', ['validateArgs'], function () {
		if (!_.isString(backupPath)) {
			return gulp.util.noop();
		}
		compressedFileName = "backup-" + moment().format("YYYY-MM-DD-HH-mm") + ".tar.gz";
		var compressCommand = "tar  -czvf  /tmp/" + compressedFileName + " -C " + path + " . ";
		var gulpSsh = createSshGulp();
		return gulpSsh.exec([compressCommand])
			.pipe(gulp.dest('logs'))
			.on('end', function () {
				gulpSsh.close();
			});
	});

	/**
	 * Copy the compressed file to the local path.
	 */
	gulp.task('backup', ['compressCurrentProject'], function () {
		if (!_.isString(backupPath)) {
			return gulp.util.noop();
		}
		console.log(compressedFileName);
		var gulpSsh = createSshGulp();
		return gulpSsh.sftp('read', "/tmp/" + compressedFileName, {filePath: compressedFileName})
			.pipe(gulp.dest(backupPath))
			.on('end', function () {
				gulpSsh.close();
			});
	});


	gulp.task('syncProject', ['backup'], function () {
		var gulpSsh = createSshGulp();
		var rsyncCommand;
		if (_.isString(password)) {
			rsyncCommand = '';
		} else {
			rsyncCommand = 'rsync -az -e "ssh  -p ' + sshPort + '-i ' + sshKeyPath + '  -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" ./* ' + username + '@' + host + ':' + path + ' --delete';
		}

		return gulpSsh.exec([rsyncCommand])
			.pipe(gulp.dest('logs'))
			.on('end', function () {
				gulpSsh.close();
			});
	});


	gulp.task('remoteCommand', function (cb) {
		return cb();
	});

	/**
	 * Deploy the project to a remote server.
	 * This task assumes the project has been built correctly.
	 *
	 */
	gulp.task('deploy', ['validateArgs', 'backup', 'syncProject'], function () {
		// host = argv[hostArg];
		// path = argv[pathArg];
		// sshKeyPath = argv[sshKeyArg];
		// backupPath = argv[backupPathArg];
		// postCommand = argv[postCommandArg];
		// sshPort = argv[sshPortArg];


		// if (!validateArguments()) {
		// 	return;
		// }
		// sshConfig = {
		// 	host      : host,
		// 	port      : sshPort,
		// 	privateKey: sshKeyPath
		// };
		console.log("Ending ....");
		// backup();
		// rsyncToDestiny();

	});
};
