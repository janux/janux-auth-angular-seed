'use strict';

var gulp = require('gulp'),
    path = require('path');

if (!gulp.cfg) {
	gulp.cfg = require('config');
} else {
	// in the event that gulp decides to define a 'gulp.cfg' field
	console.error("gulp.cfg is defined, cannot override!");
	return;
}

// Load all the tasks that are defined in the 'gulp' folder.
var taskDir = require('require-dir')('./gulp');

for (var filename in taskDir) {
	taskDir[filename](gulp);
}

gulp.task('default', ['server']);
