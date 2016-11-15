'use strict';

var path = require('path');

var cfg = {
	dir: {
		src:     'src',
		bower:   'bower',
		css:     'css',
		dist:    'dist',
		img:     'img',
		js:      'app',
		locale:  'locale',
		partial: 'view',
		server:  '../server',
		test:    'test',
		vendor:  'vendor'
	},
	file: {
		app:    'app.js',
		karma:  'karma.conf.js',
		server: 'server.js'
	},
	fileset: {}
}; 

// the pug files to watch
cfg.fileset.pug = path.join(cfg.dir.src,'**','*.pug');

// the pug 'top-level' files that will be turned into html, excludes partials;
// relative to src folder
cfg.fileset.html = [
	path.join('**','*.pug'),
	path.join('!**',cfg.dir.partial,'*')
];

cfg.fileset.js = path.join(cfg.dir.src, cfg.dir.js, '**','*.js');

// files watched during the build
cfg.fileset.watch = [
	path.join(cfg.dir.dist,'**','*.html'),
	// cfg.fileset.pug,
	path.join(cfg.dir.src, cfg.dir.css,'**','*.css'),
	path.join(cfg.dir.src, cfg.dir.css,'**','*.less'),
	path.join(cfg.dir.src, cfg.dir.img,'**','*'),
	path.join(cfg.dir.src, cfg.dir.locale,'*.json'),
	path.join(cfg.dir.dist, cfg.file.app)
];

// these are relative to the 'src' folder, and get copied to the dist folder
cfg.fileset.assets = [
	'favicon.ico',
	path.join(cfg.dir.img,'**','*.*'),
	path.join(cfg.dir.css,'font','**','*.*'),
	path.join(cfg.dir.css,'icon','**','*.*'),
	path.join(cfg.dir.locale,'*.json'),
	path.join('!**','*.less') 
];

// The 'target' less files that will be transformed into corresponding css files;
// included files are not in this set, and for 'watch' task we need all less files
cfg.fileset.less = [
	// 'typography.less',
	// 'util.less',
	// 'layout.less',
	// 'responsive.less',
	'main.less'
];

// all less sources, used for 'watch' task
cfg.fileset.lessSrc = path.join(cfg.dir.src, cfg.dir.css, '*.less');

// any css libs that need to be copied to the dist/css folder
cfg.fileset.cssLibs = [
	// path.join(cfg.dir.bower,'normalize.css', 'normalize.css'),
	// path.join(cfg.dir.bower,'bootstrap','dist','css','bootstrap.css'),
	path.join(cfg.dir.bower,'angular-aside','dist','css','angular-aside.min.css')
];

// any javascript libs that need to be copied to dist/js
cfg.fileset.jsLibs = [
	path.join(cfg.dir.bower, 'jquery', 'dist', 'jquery.js'),
	path.join(cfg.dir.bower, 'angular', 'angular.js'),
	path.join(cfg.dir.bower, 'angular-ui-router', 'release', 'angular-ui-router.js')
];

// The test specs; override this locally to run a single test suite
cfg.fileset.test = [
	path.join(cfg.dir.test,'**','*.spec.js')
];

cfg.pug = {
	debug:  false,
	pretty: true
};

cfg.jshint = {
	rcfile:   '.jshintrc',
	reporter: 'default'
};

cfg.karma = {
	singleRun: true,
	browsers: ['PhantomJS']
};

// the connect or other server config
/*
cfg.server = {
	exec: 'connect',
	root: [cfg.dir.dist],
	port: 9000,
	host: '0.0.0.0',
	open: false,
	livereload: false
};
*/

//
// gulp-express client-side config
cfg.server = {
	exec: 'express',
	file: path.join(cfg.dir.server, cfg.file.server),
	static: ''
};

// express server-side config
// Load the default config from the config file in the server project;
// this configuration also supports running 'node server.js' from the server folder
cfg.serverAppContext = require(path.join('..', cfg.dir.server, 'config', 'default.js')).serverAppContext;

module.exports = cfg;
