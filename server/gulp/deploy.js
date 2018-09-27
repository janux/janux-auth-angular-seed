'use strict';

const argv = require('yargs').argv;
const moment = require('moment');
const GulpSSH = require('gulp-ssh');
const _ = require('lodash');
const fs = require('fs');
const shell = require('shelljs');

const hostArg = 'host';
const usernameArg = 'username';
const pathArg = 'path';
const backupPathArg = 'backup-path';
const postCommandArg = 'post-command';
const sshKeyArg = 'ssh-key';
const sshPortArg = 'ssh-port';


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

		if (_.isNil(sshKeyPath) || !_.isString(sshKeyPath) || sshKeyPath.trim() === '') {
			console.error("No " + sshKeyArg + " defined ... aborting");
			isValid = false;
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
		config = {
			host      : host,
			port      : sshPort,
			privateKey: fs.readFileSync(sshKeyPath),
			username  : username
		};

		var gulpSsh = new GulpSSH({
			ignoreErrors: false,
			sshConfig   : config
		});
		return gulpSsh;
	}

	gulp.task('validateArgsAndSystem', function (cb) {
		host = argv[hostArg];
		path = argv[pathArg];
		sshKeyPath = argv[sshKeyArg];
		backupPath = argv[backupPathArg];
		postCommand = argv[postCommandArg];
		sshPort = argv[sshPortArg];
		username = argv[usernameArg];


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
	gulp.task('compressCurrentProject', ['validateArgsAndSystem'], function () {
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


	gulp.task('syncProject', ['backup'], function (cb) {
		var rsyncCommand;
		rsyncCommand = 'rsync -az -e "ssh  -p ' + sshPort + ' -i ' + sshKeyPath + '  -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" ../* ' + username + '@' + host + ':' + path + ' --delete';
		shell.exec(rsyncCommand, function (code, stdout, stderr) {
			if (code === 0) {
				console.log("Rsync executed successfully");
				cb()
			} else {
				console.error("Error running rsync \n" + stdout + "\n" + stderr);
				cb(stdout);
			}
		});
	});


	/**
	 * Deploy the project to a remote server.
	 * This task assumes the project has been built correctly.
	 *
	 */
	gulp.task('deploy', ['validateArgsAndSystem', 'backup', 'syncProject'], function (cb) {
		// Sending custom parameter.
		if (_.isString(postCommand)) {
			const postRemoteCommand = "ssh " + username + "@" + host + " -i " + sshKeyPath + " '" + postCommand + "'";
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
			return cb();
		}


		//if (_.isString(postCommand)) {
		//	console.log("Sending command");
		//	const gulpSsh = createSshGulp();
		//	return gulpSsh.exec([postCommand])
		//		.pipe(gulp.dest('logs'))
		//		.on('end', function () {
		//			gulpSsh.close();
		//		});
		//} else {
		//	console.log("Ending deploy....");
		//	return gulp.util.noop();
		//}
	});
};
