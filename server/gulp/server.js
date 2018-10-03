'use strict';

var argv = require('yargs').argv;
var gutil = require('gulp-util');
var exec = require("child_process").exec;

module.exports = function (gulp) {
	var cfg = gulp.cfg;

	gulp.task('server', function (cb) {
		exec('node ../server/server.js', function (err, stdout, stderr) {
			console.log(stdout);
			console.log(stderr);
			cb(err);
		});
	})
};
