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

/*
for (var plugin in gulp.plugins) {
	console.log(plugin);
}
*/

// Load all the tasks that are defined in the 'gulp' folder.  
var taskDir  = require('require-dir')('./gulp');

for (var filename in taskDir) {
	taskDir[filename](gulp);
}

//
// Check js syntax and browserify build
//
gulp.task('compile', ['lint','browserify']);

//
// Process all assets for development
//
gulp.task('build', ['lint','browserify','styles','pug','copy']);

//
// Process all assets for deployment
//
gulp.task('package', ['lint','minify','styles','pug','copy']);

gulp.task('package:clean', ['clean'], function() {
	gulp.start('package');
});

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
// Builds, then runs tests on built files
//
gulp.task('test', ['build'], function() {
	gulp.start('test:run');
});

//
// Quick test that assumes that we have already built, 
// and that we made incremental changes to js files;
// in particular, this does not process less and pug files
//
gulp.task('test:quick', ['lint','browserify'], function() {
	gulp.start('test:run');
});

// alias for test:quick
gulp.task('qtest', ['test:quick']);

//
// Likewise, with a clean build
// TODO: failing at the moment because karma cannot find app.js when it starts
// The issue is that 'build' is nested inside 'build:clean', and so test:run
// does not wait for 'build' to end, but starts when 'build:clean' ends and
// 'build' is still in course; 
//
gulp.task('test:clean', ['build:clean'], function() {
	// console.log('scheduling tests...');

  setTimeout(function() {
		// console.log('running tests...');
		gulp.start('test:run');
	},4000);
});


//
// Builds and runs a server without reloading or opening a browser window,
// useful if you want to build via the command line and don't want to keep
// closing new browser windows, or reloading on every change
//
gulp.task('serve', ['build:clean'], function() {
	gulp.start(gulp.cfg.server.exec);
});

gulp.task('serve-reload', function() {
	gulp.start(gulp.cfg.server.exec + '-reload');
});

// Alias for 'serve'
gulp.task('server',['serve']);

// Alias for 'serve-reload'
gulp.task('server-reload',['serve-reload']);

//
// Builds and runs from the dist folder only, to smoketest packaged app
//
/*
gulp.task('serve:dist', ['build:clean'], function() {
	gulp.start('connect-dist');
});
*/


// Simply build by default
gulp.task('default', ['build:clean']);
