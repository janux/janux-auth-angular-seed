'use strict';

var gulp   = require('gulp'),
  path     = require('path');

if (!gulp.cfg) { 
	gulp.cfg = require('config');
} else {
	// in the event that gulp decides to define a 'gulp.cfg' field
	console.error("gulp.cfg is defined, cannot override!");
	return;
}

// see config/default.js for the base configuration;
// default.js is overridable via the standard 'config' mechanism.

gulp.cfg.pkg = require('./package.json');
gulp.plugins = require('gulp-load-plugins')();


// Load all the tasks that are defined in the 'gulp' folder.  
var taskDir  = require('require-dir')('./gulp');

for (var filename in taskDir) {
	taskDir[filename](gulp);
}

//
// Process all assets for development
//
gulp.task('build', ['styles','jade','scripts','copy','browserify']);

//
// Does a clean dev build 
//
// this ensures that 'clean' is run before build; otherwise, 
// both tasks run concurrently and errors may occur
//
gulp.task('build:clean', ['clean'], function() {
	gulp.start('build');
});


//
// Builds and runs a server without reloading or opening a browser window,
// useful if you want to build via the command line and don't want to keep
// closing new browser windows, or reloading on every change
//
gulp.task('serve', ['build:clean'], function() {
	gulp.start('connect');
});

// Alias for 'serve'
gulp.task('server',['serve']);

//
// Builds and runs from the dist folder only, to smoketest packaged app
//
gulp.task('serve:dist', ['build:clean'], function() {
	gulp.start('connect-dist');
});


// Simply build by default
gulp.task('default', ['build:clean']);
